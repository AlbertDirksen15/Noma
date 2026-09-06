# Notes MVP und Projekte

Noma speichert Notizen lokal in IndexedDB über Dexie. Ein Projekt ist eine universelle `Note` mit `isProject: true`; Verschachtelung wird über `parentId` gespeichert.

Implementiert: Projektrouten, Breadcrumbs, untergeordnete Notizen/Projekte, direkte Notiz-Links, Verschieben in Root oder ein anderes Projekt, Zyklenschutz, Archiv/Papierkorb/Wiederherstellung von Subtrees sowie Soft- und endgültiges Löschen.
