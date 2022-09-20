const TypeDoc = require("typedoc");

async function main() {
    const app = new TypeDoc.Application();

    app.options.addReader(new TypeDoc.TSConfigReader());
    app.options.addReader(new TypeDoc.TypeDocReader());

    app.bootstrap({
        name: 'Lordicon Custom Element',
        entryPointStrategy: 'expand',
        entryPoints: [
            "src",
        ],
        hideGenerator: true,
        readme: 'docs/welcome.md',
        includes: 'docs/includes',
        media: 'docs/media',
        customCss: 'docs/lordicon.css',
        theme: 'default',
    });

    const project = app.convert();

    if (project) {
        const outputDir = "dist-docs";

        await app.generateDocs(project, outputDir);
        await app.generateJson(project, outputDir + "/documentation.json");
    }
}

main().catch(console.error);