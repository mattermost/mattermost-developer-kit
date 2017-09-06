const co = require('co');
const prompt = require('co-prompt');
const program = require('commander');
const inquirer = require('inquirer');
const fs = require('fs');
const os = require('os');
const ncp = require('ncp');
const replace = require('replace');

const WEBAPP_COMPONENTS = ['ProfilePopover'];

ncp.limit = 16;

program
    .arguments('<type>')
    .option('-n, --name <name>', 'The name of the plugin')
    .option('-d, --description <description>', 'A brief description of the plugin')
    .option('-c, --components <components>', 'Comma separated list of components to override')
    .action((type) => {
        console.log('Performing setup for webapp plugin...');

        let generator;
        switch (type) {
            case 'webapp':
                generator = webapp;
                break;
            default:
                console.log(`Unsupported type: ${type}`);
                return;
        }

        co(generator);
    })
    .parse(process.argv);


// TODO make this generic
function replaceTemplatePlaceholders(manifest, components, path) {
    replace({
        regex: '%plugin_name%',
        replacement: manifest.name,
        paths: [path],
        recursive: true,
        silent: true
    });

    replace({
        regex: '%plugin_id%',
        replacement: manifest.id,
        paths: [path],
        recursive: true,
        silent: true
    });

    replace({
        regex: '%plugin_description%',
        replacement: manifest.description,
        paths: [path],
        recursive: true,
        silent: true
    });

    replace({
        regex: '%plugin_components%',
        replacement: components.join(', '),
        paths: [path],
        recursive: true,
        silent: true
    });
}


function cleanComponentInput(components) {
    let i = components.length;
    while (i--) {
        if (!WEBAPP_COMPONENTS.includes(components[i])) {
            console.log(`WARNING: Unsupported component '${components[i]}' ignored`);
            components.splice(i, 1);
        }
    }

    return components;
}

function* webapp() {
    const manifest = {};

    if (typeof program.name === 'string') {
        console.log(`Plugin name: ${program.name}`);
        manifest.name = program.name;
    } else {
        manifest.name = yield prompt('Plugin name: ');
    }

    manifest.id = manifest.name.toLowerCase().trim().replace(/\s+/g, '-');

    if (typeof program.description === 'string') {
        console.log(`Description: ${program.description}`);
        manifest.description = program.description;
    } else {
        manifest.description = yield prompt('Description: ');
    }

    let components;
    if (typeof program.components === 'string') {
        components = cleanComponentInput(program.components.replace(/\s+/g, '').split(','));
        console.log(`Components: ${components}`);
    } else {
        const results = yield inquirer.prompt([
            {
                type: 'checkbox',
                name: 'components',
                message: 'What components would you like to override with your plugin?',
                choices: ['ProfilePopover']
            }
        ]);

        components = results.components;
    }

    const homePath = `${(process.env.MDK_PLUGIN_PATH || process.cwd())}`;

    // Create home directory if not exists
    if (!fs.existsSync(homePath)) {
        fs.mkdirSync(homePath);
    }

    const pluginPath = `${homePath}/${manifest.id}`;
    if (fs.existsSync(pluginPath)) {
        console.log(`A directory already exists at ${pluginPath}. Please remove it or pick a new plugin name`);
        return;
    }

    const webappPath = `${pluginPath}/webapp`;

    fs.mkdirSync(pluginPath);
    fs.mkdirSync(webappPath);

    ncp(__dirname + '/templates/webapp', webappPath, () => replaceTemplatePlaceholders(manifest, components, webappPath));
    ncp(__dirname + '/templates/plugins', pluginPath, () => replaceTemplatePlaceholders(manifest, components, pluginPath));

    console.log();
    console.log(`Plugin generated at: ${pluginPath}`);
}
