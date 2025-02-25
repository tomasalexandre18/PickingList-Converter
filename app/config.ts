// It is used to store the configuration of the application in the local storage of the browser.

export type Config = {
    name: string;
    subCategory: string[];
}[];

export function importConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', async () => {
        const files = input.files;
        if (files && files.length > 0) {
            const file = files[0];
            const data = await file.text();
            let config: unknown;
            try {
                config = JSON.parse(data);
            } catch (e) {
                console.error(e);
                alert('Fichier de configuration invalide');
                return;
            }
            // check if the configuration is valid
            if (!Array.isArray(config)) {
                alert('Fichier de configuration invalide');
                return;
            }

            if (!config.every((cat) => {
                return typeof cat.name === 'string' && Array.isArray(cat.subCategory) && cat.subCategory.every((subCat: unknown) => typeof subCat === 'string');
            })) {
                alert('Fichier de configuration invalide');
                return;
            }

            window.localStorage.setItem('config', data);
            // fire local-storage event to update useLocalStorage hooks
            window.dispatchEvent(new Event('local-storage'));
        }
    });
    input.click()
}

export function exportConfig() {
    let config = window.localStorage.getItem('config');
    if (!config) {
        config = '[]';
    }
    const blob = new Blob([config], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    a.click();
    URL.revokeObjectURL(url);
}