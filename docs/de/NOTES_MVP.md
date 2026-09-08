# Notes MVP und Projekte

Noma speichert Notizen lokal in IndexedDB über Dexie. Ein Projekt ist eine universelle `Note` mit `isProject: true`; Verschachtelung wird über `parentId` gespeichert.

Implementiert: Projektrouten, Breadcrumbs, untergeordnete Notizen/Projekte, direkte Notiz-Links, Verschieben in Root oder ein anderes Projekt, Zyklenschutz, Archiv/Papierkorb/Wiederherstellung von Subtrees sowie Soft- und endgültiges Löschen.
# Time Tracking (MVP 0.4)

Zeitmessung ist eine optionale Fähigkeit jeder Notiz und jedes Projekts. Sitzungen werden in IndexedDB gespeichert und unterstützen Start/Pause/Resume/Stop, manuelle Einträge, Summen und Verlauf. Global läuft nur ein Timer.

Ziele speichern Zielstunden und ein fixes lokales Kalenderdatum. Das tägliche Tempo wird aus Reststunden und Kalendertagen berechnet. Die kompakte Oberfläche zeigt Ziel, Frist und Restzeit; der Zeitblock zeigt Gesamtzeit, heutige Zeit und benötigte Stunden pro Tag. Diagramm, Vorsprung/Rückstand und Prognose gehören bewusst nicht zum MVP 0.5.

## Notizversionsverlauf (MVP 0.7)

Noma speichert dauerhafte Snapshots vor bedeutenden Änderungen an Notizen oder Projekten: Titel, Inhalt, Farbe, Today/Inbox, Position im Baum, Zeiterfassung, Pomodoro-Einstellung und Zielfelder. Wiederholte Autosaves werden in einem dreiminütigen Bearbeitungsfenster zusammengefasst; pro Notiz bleiben die neuesten 100 Versionen erhalten. Im Verlauf lassen sich alte Versionen ansehen, vollständig wiederherstellen oder nur Titel und Inhalt übernehmen. Version Restore behält dieselbe Note-ID und Tracking-Sessions; ist der historische Parent nicht verfügbar oder unsicher, bleibt der aktuelle sichere Parent erhalten. Wiederherstellung aus Papierkorb/Archiv ist davon getrennte Lifecycle-Wiederherstellung.

## Workspace-Backup (MVP 0.8)

Der lokale Workspace kann als versionierte JSON-Datei exportiert und wiederhergestellt werden: Notizen, Tracking-Sessions, Revisionen, Tombstones sowie Workspace-/Geräteidentität. Das geplante Drive-Ziel ist der sichtbare Benutzerordner `Google Drive / Noma/`; `appDataFolder` wird nicht verwendet. Der Drive-Upload bleibt bis zur Konfiguration von OAuth-Anmeldedaten deaktiviert.

## Lokaler Desktop-Modus

`npm run desktop` baut das bestehende Frontend, startet einen Node-Server ausschließlich auf `127.0.0.1:3847` (oder dem nächsten freien Port) und öffnet den normalen Browser. `npm run desktop:serve` startet den Server ohne Browseröffnung. Dies ist kein Cloud-Backend und kein natives EXE.

Für einen portablen Windows-Ordner führt man `npm run build:portable` aus. Der von Git ignorierte Ordner `release/Noma-portable/` enthält `Noma.cmd`, `Noma.ps1`, `README_RUN.txt`, den production-`dist/`-Ordner und den lokalen Server. Node.js muss installiert sein; ein gebündeltes `Noma.exe` ist ein späterer Packaging-Schritt.

## MVP 0.9 — Portable, 0.9.0-local.0

## Noma 1.0 Beta

`npm run build:windows` erstellt `release/Noma-portable/Noma.exe` und legt die Node-Laufzeit daneben ab. Noma.exe startet Noma offline ohne separat installiertes Node.js. Der gesamte portable Ordner muss zusammen bleiben. Eine Signatur und ein Windows-Installer folgen später.

Erstellen: `npm run build:portable`. Den gesamten Ordner `release/Noma-portable` mit Noma.cmd, Noma.ps1, README_RUN.txt, dist und server kopieren. Node.js 22.12+ oder 24 LTS muss im PATH installiert sein. Auf dem Zielcomputer ist kein npm install erforderlich. Noch keine gebündelte oder signierte EXE.

Start mit Noma.cmd; der Browser öffnet sich automatisch. Der Server bindet nur an 127.0.0.1:3847 und versucht bei Belegung den nächsten Port. NOMA_PORT überschreibt den Startport. Mit Strg+C im Terminal beenden; das Schließen des Browsers beendet den Server nicht. Noma.ps1 unterliegt der PowerShell-Ausführungsrichtlinie. Vor erneutem Erstellen den Server beenden.

Daten liegen in IndexedDB im Browserprofil, nicht im Portable-Ordner. Ein anderer Port oder ein anderes Profil kann leer erscheinen. Zum ursprünglichen Port zurückkehren oder Workspace Export/Import verwenden. Vor einem Computerwechsel Daten exportieren. Prüfungen: lint, typecheck, test, build, build:portable.


## 2026-09-08

Notizen werden bei Änderungen automatisch gespeichert. Karten lassen sich anheften und innerhalb ihrer Gruppe per Ziehen sortieren. Heute enthält zwei angeheftete Standardnotizen. Zeitziele benötigen kein Datum. Das Einklappen pausiert den Timer; Zurücksetzen erhält die erfasste Zeit. Projekte werden über die Seitenleiste erstellt. Theme-Variablen und Core-Dienste bereiten die spätere Trennung von Plugins und Themes vor; siehe ../EXTENSIBILITY.md.


## Timer — 08.09.2026

Der kleine Indikator bleibt bei laufender und pausierter Sitzung grün gefüllt. Gesamtzeit zurücksetzen steht unter der Summe und erhält Verlauf, Ziel-Fortschritt und heutige Zeit. Timer zurücksetzen befindet sich im Pomodoro-Menü.
