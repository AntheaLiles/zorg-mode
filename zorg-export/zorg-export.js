if (typeof Zotero === 'undefined') {
    var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
    Services.scriptloader.loadSubScript("chrome://zotero/content/include.js");
}

Zotero.ZorgMode = {
    init: function() {
        Zotero.Translators.add({
            translatorID: "org-mode-export",
            label: "Org-mode",
            creator: "Your Name",
            target: "org",
            configOptions: {
                getCollections: true
            },
            displayOptions: {
                exportFileData: false
            },
            doExport: this.doExport.bind(this)
        });
    },

    doExport: async function(translator, items) {
        try {
            let orgContent = "";
            for (let item of items) {
                orgContent += this.convertToOrg(item);
            }

            var file = Zotero.File.pathToFile(Zotero.DataDirectory.dir);
            file.append("zotero_export.org");

            await Zotero.File.putContentsAsync(file, orgContent);
            Zotero.debug("Exportation terminée. Fichier créé : " + file.path);
            
            return orgContent;
        } catch (error) {
            Zotero.debug("Erreur lors de l'exportation : " + error, 1);
            Zotero.log.error("Erreur d'exportation", error);
        }
    },

    convertToOrg: function(item) {
        var orgContent = "* " + item.getField('title') + "\n\n";
        orgContent += ":PROPERTIES:\n";

        var fields = ['date', 'creators', 'itemType', 'publicationTitle', 'volume', 'issue', 'pages', 'DOI', 'ISBN', 'ISSN', 'url', 'accessDate', 'language', 'libraryCatalog', 'shortTitle', 'rights'];

        fields.forEach(function(field) {
            var value = item.getField(field);
            if (value) {
                if (field === 'creators') {
                    value = item.getCreators().map(function(creator) {
                        return creator.firstName + " " + creator.lastName;
                    }).join(", ");
                }
                orgContent += ":" + field.toUpperCase() + ": " + value + "\n";
            }
        });

        orgContent += ":END:\n\n";

        var abstract = item.getField('abstractNote');
        if (abstract) {
            orgContent += abstract + "\n\n";
        }

        return orgContent;
    }
};

// Initialiser le plugin
window.addEventListener('load', function(e) {
    if (e.target.documentURI == "chrome://zotero/content/zoteroPane.xhtml") {
        Zotero.ZorgMode.init();
    }
}, false);
