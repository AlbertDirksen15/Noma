using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Windows.Forms;

internal static class NomaLauncher
{
    private const int DefaultPort = 3847;
    private const string Host = "127.0.0.1";
    private const string MutexName = "Local\\Noma.Desktop.Launcher";
    private const string HealthBody = "{\"app\":\"noma-desktop\"}";

    private static string Quote(string value)
    {
        return "\"" + value.Replace("\"", "\\\"") + "\"";
    }

    private static void ShowError(string message)
    {
        MessageBox.Show(message, "Noma", MessageBoxButtons.OK, MessageBoxIcon.Error);
    }

    private static bool ValidatePortableFiles(string runtime, string server, string dist)
    {
        var missing = new List<string>();
        if (!File.Exists(runtime)) missing.Add("runtime\\node.exe");
        if (!File.Exists(server)) missing.Add("server\\desktop-server.mjs");
        if (!File.Exists(Path.Combine(dist, "index.html"))) missing.Add("dist\\index.html");
        if (missing.Count == 0) return true;

        ShowError("Noma не может запуститься. В portable-папке отсутствуют обязательные файлы:\n\n"
            + string.Join("\n", missing.ToArray())
            + "\n\nИспользуйте полную папку release\\Noma-portable.");
        return false;
    }

    private static bool TryReadPort(string runtimeFile, out int port)
    {
        port = 0;
        try
        {
            if (!File.Exists(runtimeFile)) return false;
            var json = File.ReadAllText(runtimeFile, Encoding.UTF8);
            var match = Regex.Match(json, "\\\"port\\\"\\s*:\\s*(\\d+)");
            return match.Success && int.TryParse(match.Groups[1].Value, out port) && port > 0 && port <= 65535;
        }
        catch
        {
            return false;
        }
    }

    private static bool IsNoma(int port)
    {
        try
        {
            var request = (HttpWebRequest)WebRequest.Create("http://" + Host + ":" + port + "/__noma_health");
            request.Method = "GET";
            request.Timeout = 500;
            using (var response = (HttpWebResponse)request.GetResponse())
            using (var reader = new StreamReader(response.GetResponseStream()))
            {
                return response.StatusCode == HttpStatusCode.OK && reader.ReadToEnd() == HealthBody;
            }
        }
        catch
        {
            return false;
        }
    }

    private static bool WaitForExisting(string runtimeFile, out int port)
    {
        port = 0;
        for (var attempt = 0; attempt < 40; attempt++)
        {
            var candidates = new List<int>();
            int statePort;
            if (TryReadPort(runtimeFile, out statePort)) candidates.Add(statePort);
            if (!candidates.Contains(DefaultPort)) candidates.Add(DefaultPort);
            foreach (var candidate in candidates)
            {
                if (IsNoma(candidate))
                {
                    port = candidate;
                    return true;
                }
            }
            if (attempt < 39) Thread.Sleep(100);
        }
        return false;
    }

    private static void OpenBrowser(int port)
    {
        try
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = "http://" + Host + ":" + port,
                UseShellExecute = true
            });
        }
        catch (Exception error)
        {
            ShowError("Noma запущена, но браузер не удалось открыть:\n\n" + error.Message);
        }
    }

    private static Process StartServer(string runtime, string server, string dist, string runtimeFile, string token, bool shouldOpen, string[] args)
    {
        var passThrough = string.Join(" ", args.Where(arg => arg != "--no-open").Select(Quote).ToArray());
        var command = Quote(server)
            + " --dist=" + Quote(dist)
            + " --port=" + DefaultPort
            + " --runtime-file=" + Quote(runtimeFile)
            + " --shutdown-token=" + Quote(token);
        if (shouldOpen) command += " --open";
        if (!string.IsNullOrWhiteSpace(passThrough)) command += " " + passThrough;

        return Process.Start(new ProcessStartInfo
        {
            FileName = runtime,
            Arguments = command,
            WorkingDirectory = Path.GetDirectoryName(runtime),
            UseShellExecute = false,
            CreateNoWindow = true,
            WindowStyle = ProcessWindowStyle.Hidden
        });
    }

    private static bool WaitForStarted(Process process, string runtimeFile, out int port)
    {
        port = 0;
        for (var attempt = 0; attempt < 100; attempt++)
        {
            if (process.HasExited) return false;
            if (TryReadPort(runtimeFile, out port) && IsNoma(port)) return true;
            Thread.Sleep(100);
        }
        return false;
    }

    private static bool RequestShutdown(int port, string token)
    {
        try
        {
            var request = (HttpWebRequest)WebRequest.Create("http://" + Host + ":" + port + "/__noma_shutdown?token=" + Uri.EscapeDataString(token));
            request.Method = "POST";
            request.Timeout = 1200;
            request.ContentLength = 0;
            using (var response = (HttpWebResponse)request.GetResponse())
            {
                return response.StatusCode == HttpStatusCode.NoContent || response.StatusCode == HttpStatusCode.OK;
            }
        }
        catch
        {
            return false;
        }
    }

    private static bool StopOwnedServer(Process process, int port, string token, string runtimeFile)
    {
        var requested = RequestShutdown(port, token);
        for (var attempt = 0; attempt < 40; attempt++)
        {
            if (process.HasExited)
            {
                if (File.Exists(runtimeFile)) File.Delete(runtimeFile);
                return requested;
            }
            Thread.Sleep(100);
        }

        // Only the child process started by this launcher may be terminated as a last resort.
        try
        {
            if (!process.HasExited) process.Kill();
            process.WaitForExit(2000);
            if (File.Exists(runtimeFile)) File.Delete(runtimeFile);
            return requested && process.HasExited;
        }
        catch
        {
            return false;
        }
    }

    [STAThread]
    public static int Main(string[] args)
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);

        var root = AppDomain.CurrentDomain.BaseDirectory;
        var runtime = Path.Combine(root, "runtime", "node.exe");
        var server = Path.Combine(root, "server", "desktop-server.mjs");
        var dist = Path.Combine(root, "dist");
        var runtimeFile = Path.Combine(root, "noma-runtime.json");
        var shouldOpen = !args.Contains("--no-open");

        bool createdNew;
        using (var mutex = new Mutex(true, MutexName, out createdNew))
        {
            int existingPort;
            if (!createdNew)
            {
                if (WaitForExisting(runtimeFile, out existingPort))
                {
                    OpenBrowser(existingPort);
                    return 0;
                }
                ShowError("Noma уже запускается, но работающий сервер не найден. Повторите запуск через несколько секунд.");
                return 1;
            }

            if (!ValidatePortableFiles(runtime, server, dist)) return 1;

            if (WaitForExisting(runtimeFile, out existingPort))
            {
                OpenBrowser(existingPort);
                return 0;
            }
            try
            {
                if (File.Exists(runtimeFile)) File.Delete(runtimeFile);
            }
            catch (Exception error)
            {
                ShowError("Не удалось очистить состояние предыдущего запуска Noma:\n\n" + error.Message);
                return 1;
            }

            var token = Guid.NewGuid().ToString("N");
            Process process;
            try
            {
                process = StartServer(runtime, server, dist, runtimeFile, token, shouldOpen, args);
                if (process == null) throw new InvalidOperationException("Процесс Noma не был запущен.");
            }
            catch (Exception error)
            {
                ShowError("Noma не удалось запустить:\n\n" + error.Message);
                return 1;
            }

            int port;
            if (!WaitForStarted(process, runtimeFile, out port))
            {
                try { if (!process.HasExited) process.Kill(); } catch { }
                try { if (File.Exists(runtimeFile)) File.Delete(runtimeFile); } catch { }
                ShowError("Noma не запустила локальный сервер. Проверьте целостность portable-папки release\\Noma-portable.");
                process.Dispose();
                return 1;
            }

            using (process)
            using (var context = new NomaApplicationContext(process, port, token, runtimeFile))
            {
                Application.Run(context);
            }
            return 0;
        }
    }

    private sealed class NomaApplicationContext : ApplicationContext
    {
        private readonly Process process;
        private readonly int port;
        private readonly string token;
        private readonly string runtimeFile;
        private readonly NotifyIcon tray;
        private readonly System.Windows.Forms.Timer monitor;
        private bool exiting;

        public NomaApplicationContext(Process process, int port, string token, string runtimeFile)
        {
            this.process = process;
            this.port = port;
            this.token = token;
            this.runtimeFile = runtimeFile;

            var menu = new ContextMenuStrip();
            var open = new ToolStripMenuItem("Open Noma");
            open.Click += delegate { OpenBrowser(this.port); };
            var exit = new ToolStripMenuItem("Exit Noma");
            exit.Click += delegate { ExitNoma(); };
            menu.Items.Add(open);
            menu.Items.Add(new ToolStripSeparator());
            menu.Items.Add(exit);

            tray = new NotifyIcon
            {
                Icon = SystemIcons.Application,
                Text = "Noma",
                ContextMenuStrip = menu,
                Visible = true
            };
            tray.DoubleClick += delegate { OpenBrowser(this.port); };

            monitor = new System.Windows.Forms.Timer { Interval = 1000 };
            monitor.Tick += delegate
            {
                if (!this.process.HasExited || exiting) return;
                monitor.Stop();
                tray.Visible = false;
                tray.Dispose();
                try { if (File.Exists(this.runtimeFile)) File.Delete(this.runtimeFile); } catch { }
                ShowError("Локальный сервер Noma завершился. Запустите Noma снова.");
                Application.ExitThread();
            };
            monitor.Start();
        }

        private void ExitNoma()
        {
            if (exiting) return;
            exiting = true;
            monitor.Stop();
            tray.Visible = false;
            tray.Dispose();
            var stopped = StopOwnedServer(process, port, token, runtimeFile);
            if (!stopped)
            {
                ShowError("Noma закрыта, но локальный сервер не подтвердил корректное завершение.");
            }
            Application.ExitThread();
        }
    }
}
