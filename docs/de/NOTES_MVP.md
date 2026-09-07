# Notes MVP und Projekte

Noma speichert Notizen lokal in IndexedDB über Dexie. Ein Projekt ist eine universelle `Note` mit `isProject: true`; Verschachtelung wird über `parentId` gespeichert.

Implementiert: Projektrouten, Breadcrumbs, untergeordnete Notizen/Projekte, direkte Notiz-Links, Verschieben in Root oder ein anderes Projekt, Zyklenschutz, Archiv/Papierkorb/Wiederherstellung von Subtrees sowie Soft- und endgültiges Löschen.
# Time Tracking (MVP 0.4)

Zeitmessung ist eine optionale Fähigkeit jeder Notiz und jedes Projekts. Sitzungen werden in IndexedDB gespeichert und unterstützen Start/Pause/Resume/Stop, manuelle Einträge, Summen und Verlauf. Global läuft nur ein Timer.

Ziele speichern Zielstunden und ein fixes lokales Kalenderdatum. Das tägliche Tempo wird aus Reststunden und Kalendertagen berechnet. Die kompakte Oberfläche zeigt Ziel, Frist und Restzeit; der Zeitblock zeigt Gesamtzeit, heutige Zeit und benötigte Stunden pro Tag. Diagramm, Vorsprung/Rückstand und Prognose gehören bewusst nicht zum MVP 0.5.

## Notizversionsverlauf (MVP 0.7)

Noma speichert dauerhafte Snapshots vor bedeutenden Änderungen an Notizen oder Projekten: Titel, Inhalt, Farbe, Today/Inbox, Position im Baum, Zeiterfassung, Pomodoro-Einstellung und Zielfelder. Wiederholte Autosaves werden in einem dreiminütigen Bearbeitungsfenster zusammengefasst; pro Notiz bleiben die neuesten 100 Versionen erhalten. Im Verlauf lassen sich alte Versionen ansehen, vollständig wiederherstellen oder nur Titel und Inhalt übernehmen. Version Restore behält dieselbe Note-ID und Tracking-Sessions; ist der historische Parent nicht verfügbar oder unsicher, bleibt der aktuelle sichere Parent erhalten. Wiederherstellung aus Papierkorb/Archiv ist davon getrennte Lifecycle-Wiederherstellung.
