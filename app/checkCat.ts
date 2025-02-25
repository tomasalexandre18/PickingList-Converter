import {Config} from "./config";

export const checkCat = (listSub: string[], config: Config): string[] => {
    const missing: string[] = [];
    for (const sub of listSub) {
        // Check if the sub category is in the configuration and if not add it to the missing list
        let found = false;
        for (const cat of config) {
            if (cat.subCategory.includes(sub)) {
                found = true;
                break;
            }
        }
        if (!found) {
            missing.push(sub);
        }
    }
    return missing;
}