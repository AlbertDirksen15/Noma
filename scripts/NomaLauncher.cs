using System;
using System.Diagnostics;
using System.IO;
using System.Linq;

internal static class NomaLauncher
{
    private static string Quote(string value)
    {
        return "\"" + value.Replace("\\", "\\\\").Replace("\"", "\\\"") + "\"";
    }

    public static int Main(string[] args)
    {
        var root = AppDomain.CurrentDomain.BaseDirectory;
        var runtime = Path.Combine(root, "runtime", "node.exe");
        var server = Path.Combine(root, "server", "desktop-server.mjs");
        var dist = Path.Combine(root, "dist");

        if (!File.Exists(runtime))
        {
            Console.Error.WriteLine("Noma runtime is missing: " + runtime);
            Console.Error.WriteLine("Download a complete Noma release and try again.");
            return 1;
        }
        if (!File.Exists(server) || !File.Exists(Path.Combine(dist, "index.html")))
        {
            Console.Error.WriteLine("Noma production files are missing. Download a complete Noma release and try again.");
            return 1;
        }

        var shouldOpen = !args.Contains("--no-open");
        var passThrough = string.Join(" ", args.Where(arg => arg != "--no-open").Select(Quote).ToArray());
        var command = Quote(server) + " --dist=" + Quote(dist);
        if (shouldOpen) command += " --open";
        if (!string.IsNullOrWhiteSpace(passThrough)) command += " " + passThrough;

        try
        {
            using (var process = Process.Start(new ProcessStartInfo
            {
                FileName = runtime,
                Arguments = command,
                WorkingDirectory = root,
                UseShellExecute = false
            }))
            {
                if (process == null) throw new InvalidOperationException("Noma runtime did not start.");
                process.WaitForExit();
                return process.ExitCode;
            }
        }
        catch (Exception error)
        {
            Console.Error.WriteLine("Unable to start Noma: " + error.Message);
            return 1;
        }
    }
}
