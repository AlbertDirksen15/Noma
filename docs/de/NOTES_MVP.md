# Notes MVP und Projekte

Noma speichert Notizen lokal in IndexedDB über Dexie. Ein Projekt ist eine universelle `Note` mit `isProject: true`; Verschachtelung wird über `parentId` gespeichert.

Implementiert: Projektrouten, Breadcrumbs, untergeordnete Notizen/Projekte, direkte Notiz-Links, Verschieben in Root oder ein anderes Projekt, Zyklenschutz, Archiv/Papierkorb/Wiederherstellung von Subtrees sowie Soft- und endgültiges Löschen.
# Time Tracking (MVP 0.4)

Zeitmessung ist eine optionale Fähigkeit jeder Notiz und jedes Projekts. Sitzungen werden in IndexedDB gespeichert und unterstützen Start/Pause/Resume/Stop, manuelle Einträge, Summen und Verlauf. Global läuft nur ein Timer.

Ziele speichern Zielstunden und ein fixes lokales Kalenderdatum. Das tägliche Tempo wird aus Reststunden und Kalendertagen berechnet. Die kompakte Oberfläche zeigt Ziel, Frist und Restzeit; der Zeitblock zeigt Gesamtzeit, heutige Zeit und benötigte Stunden pro Tag. Diagramm, Vorsprung/Rückstand und Prognose gehören bewusst nicht zum MVP 0.5.
