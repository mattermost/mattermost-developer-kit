const co = require('co');
const prompt = require('co-prompt');
const program = require('commander');
const inquirer = require('inquirer');
const fs = require('fs');
const os = require('os');
const denodeify = require('denodeify');
const ncp = denodeify(require('ncp').ncp)
const replace = require('replace');
const chalk = require('chalk');

const WEBAPP_COMPONENTS = {
    ProfilePopover: 'profile_popover',
    Root: 'root'
};

const INTEGRATION_TYPES = [
    'rest_api',
    'incoming_webhook (coming soon)',
    'outgoing_webhook (coming soon)',
    'slash_command (coming soon)'
];

const AUTH_METHODS = [
    'personal_access_token',
    'email_password (coming soon)',
    'oauth2 (coming soon)'
];

ncp.limit = 16;

program
    .arguments('<type>')
    .option('-n, --name <name>', 'Name of the plugin/integration')
    .option('-d, --description <description>', '(Plugins) Brief description of the plugin')
    .option('-c, --components <components>', '(Plugins) Comma separated list of components to override')
    .option('-p, --post-types <post-types>', '(Plugins) Comma separated list of post types')
    .option('-t, --type <type>', '(Integrations) Type of integration to generate')
    .option('-a, --auth-method <auth-method>', '(REST API) Authentication method for the integration')
    .option('-S, --skip-prompts', 'Skip optional user input prompts')
    .option('-q, --quiet', 'Suppress non-error messages')
    .action((type) => {
        let generator;
        switch (type) {
            case 'plugin':
                generator = plugin;
                break;
            case 'integration':
                generator = integration;
                break;
            default:
                log(`Unsupported type: ${type}`);
                return;
        }

        co(generator);
    })
    .parse(process.argv);


// ---------------------------------------------------
// Plugin Functions
// ---------------------------------------------------

function* plugin() {
    log(chalk.underline.bold.cyan('Plugin Generation'));
    log();

    const manifest = {};

    if (typeof program.name === 'string') {
        log(chalk.bold('Plugin name: ') + program.name);
        manifest.name = program.name;
    } else {
        manifest.name = yield prompt(chalk.bold('Plugin name: '));
    }

    manifest.id = manifest.name.toLowerCase().trim().replace(/\s+/g, '-');

    if (typeof program.description === 'string') {
        log(chalk.bold('Description: ') + program.description);
        manifest.description = program.description;
    } else if (program.skipPrompts) {
        manifest.description = '';
    } else {
        manifest.description = yield prompt(chalk.bold('Description: '));
    }

    const optionsForWebapp = yield* webappOptions();

    const homePath = `${(process.env.MDK_PLUGIN_PATH || process.cwd())}`;

    // Create home directory if not exists
    if (!fs.existsSync(homePath)) {
        fs.mkdirSync(homePath);
    }

    const pluginPath = `${homePath}/${manifest.id}`;
    if (fs.existsSync(pluginPath)) {
        console.error(chalk.red(`A directory already exists at ${pluginPath}. Please remove it or pick a new plugin name.`));
        process.exit(1);
    }

    fs.mkdirSync(pluginPath);

    ncp(__dirname + '/templates/plugins', pluginPath).then(() => {
        replaceTemplatePlaceholders(manifest, pluginPath);

        webappComplete(manifest, optionsForWebapp, pluginPath).then(() => {
            log();
            log(chalk.bold.magenta('Plugin generated at: ') + pluginPath);
            process.exit(0);
        });
    });
}

function* webappOptions() {
    log();
    log(chalk.bold.cyan('Webapp'));
    log();

    let components = [];
    if (typeof program.components === 'string') {
        components = cleanComponentInput(program.components.replace(/\s+/g, '').split(','));
        log(chalk.bold('Components: ') + components);
    } else if (!program.skipPrompts) {
        const results = yield inquirer.prompt([
            {
                type: 'checkbox',
                name: 'components',
                message: chalk.bold('Override Components: '),
                choices: Object.keys(WEBAPP_COMPONENTS)
            }
        ]);

        components = results.components;
    }

    let postTypes = [];
    if (typeof program.postTypes === 'string') {
        log(chalk.bold('Post Types: ') + program.postTypes);
        postTypes = program.postTypes.replace(/\s+/g, '').split(',');
    } else if (!program.skipPrompts) {
        const input = (yield prompt(chalk.bold('Post Types (comma separated, leave blank to skip): '))).replace(/\s+/g, '');
        if (input) {
            postTypes = input.split(',');
        }
    }

    return {components, postTypes};
}

async function webappComplete(manifest, options, path) {
    const webappPath = `${path}/webapp`;

    fs.mkdirSync(webappPath);

    // Build import statements for index.js
    const components = options.components;

    let componentImports = '';
    components.forEach((name) => {
        componentImports += `import ${name} from './components/${WEBAPP_COMPONENTS[name]}';\n`;
    });

    const postTypes = options.postTypes;

    let postTypeImports = '';
    let postTypeComponents = [];
    postTypes.forEach((type) => {
        postTypeImports += `import PostType${toTitleCase(type)} from './components/post_type_${type}';\n`;
        postTypeComponents.push(`custom_${type}: PostType${toTitleCase(type)}`);
    });

    let imports = '';
    if (componentImports || postTypeImports) {
        imports = '\n' + componentImports + postTypeImports;
    }

    const replacements = [
        {regex: '%plugin_components%', replacement: components.join(', ')},
        {regex: '%plugin_post_types%', replacement: postTypeComponents.join(', ')},
        {regex: '%plugin_imports%', replacement: imports}
    ];

    // Copy all webapp template files
    await ncp(__dirname + '/templates/webapp', webappPath);

    // Remove unused component templates
    for (let name of Object.keys(WEBAPP_COMPONENTS).diff(components)) {
        const id = WEBAPP_COMPONENTS[name];
        fs.unlinkSync(`${webappPath}/components/${id}/index.js`);
        fs.unlinkSync(`${webappPath}/components/${id}/${id}.jsx`);
        fs.rmdirSync(`${webappPath}/components/${id}`);
    }

    // Create post type components
    for (let type of postTypes) {
        const typePath = `${webappPath}/components/post_type_${type}`;
        fs.mkdirSync(typePath);

        await ncp(__dirname + '/templates/webapp/components/post_type_template/index.js', typePath + '/index.js');
        await ncp(__dirname + '/templates/webapp/components/post_type_template/post_type_template.jsx', `${typePath}/post_type_${type}.jsx`);

        const replacements = [
            {regex: '%type%', replacement: type},
            {regex: '%Type%', replacement: toTitleCase(type)}
        ];

        replaceTemplatePlaceholders(manifest, typePath, replacements);
    }

    fs.unlinkSync(`${webappPath}/components/post_type_template/index.js`);
    fs.unlinkSync(`${webappPath}/components/post_type_template/post_type_template.jsx`);
    fs.rmdirSync(`${webappPath}/components/post_type_template`);

    replaceTemplatePlaceholders(manifest, webappPath, replacements);
}

// ---------------------------------------------------
// Integration Functions
// ---------------------------------------------------

function* integration() {
    log(chalk.underline.bold.cyan('Integration Generation'));
    log();

    const manifest = {};

    if (typeof program.name === 'string') {
        log(chalk.bold('Integration name: ') + program.name);
        manifest.name = program.name;
    } else {
        manifest.name = yield prompt(chalk.bold('Integration name: '));
    }

    manifest.id = manifest.name.toLowerCase().trim().replace(/\s+/g, '-');

    let type = '';
    if (typeof program.type === 'string') {
        log(chalk.bold('Integration Type: ') + program.type);
        type = program.type;
    } else if (!program.skipPrompts) {
        const results = yield inquirer.prompt([
            {
                type: 'list',
                name: 'type',
                message: chalk.bold('Integration Type: '),
                choices: INTEGRATION_TYPES
            }
        ]);

        type = results.type;
    }

    if (type !== 'rest_api') {
        console.error(chalk.red(`Unsupported type: ${type}`));
        process.exit(1);
    }

    const typeOptions = yield* restApiOptions();

    if (typeOptions.authMethod !== 'personal_access_token') {
        console.error(chalk.red(`Unsupported authentication method: ${typeOptions.authMethod}`));
        process.exit(1);
    }

    const homePath = `${(process.env.MDK_PLUGIN_PATH || process.cwd())}`;

    // Create home directory if not exists
    if (!fs.existsSync(homePath)) {
        fs.mkdirSync(homePath);
    }

    const integrationPath = `${homePath}/${manifest.id}`;
    if (fs.existsSync(integrationPath)) {
        console.error(chalk.red(`A directory already exists at ${integrationPath}. Please remove it or pick a new integration name.`));
        process.exit(1);
    }

    fs.mkdirSync(integrationPath);


    restApiComplete(manifest, typeOptions, integrationPath).then(() => {
        log();
        log(chalk.bold.magenta('Plugin generated at: ') + integrationPath);
        process.exit(0);
    });
}

function* restApiOptions() {
    log();
    log(chalk.bold.cyan('REST API'));
    log();

    let authMethod = '';
    if (typeof program.authMethod === 'string') {
        log(chalk.bold('Authentication Method: ') + program.authMethod);
        authMethod = program.authMethod;
    } else if (!program.skipPrompts) {
        const results = yield inquirer.prompt([
            {
                type: 'list',
                name: 'authMethod',
                message: chalk.bold('Authentication Method: '),
                choices: AUTH_METHODS
            }
        ]);

        authMethod = results.authMethod;
    }

    return {authMethod};
}

async function restApiComplete(manifest, options, path) {
    // Copy all rest api template files
    await ncp(__dirname + '/templates/rest-api', path);
    replaceTemplatePlaceholders(manifest, path);
}

// ---------------------------------------------------
// Helper Functions
// ---------------------------------------------------

function replaceTemplatePlaceholders(manifest, path, customReplacements = []) {
    const replacements = [
        {regex: '%plugin_name%', replacement: manifest.name},
        {regex: '%plugin_id%', replacement: manifest.id},
        {regex: '%plugin_description%', replacement: manifest.description},
        ...customReplacements
    ];

    replacements.forEach((r) => {
        replace({
            regex: r.regex,
            replacement: r.replacement,
            paths: [path],
            recursive: true,
            silent: true
        });
    });
}

function cleanComponentInput(components) {
    let i = components.length;
    const webappComponents = Object.keys(WEBAPP_COMPONENTS);
    while (i--) {
        if (!webappComponents.includes(components[i])) {
            log(`WARNING: Unsupported component '${components[i]}' ignored`);
            components.splice(i, 1);
        }
    }

    return components;
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

function log(message = '') {
    if (!program.quiet) {
        console.log(message);
    }
}
