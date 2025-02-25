
export const readCsv = async (buffer: File | Blob, delimiter: string = ","): Promise<Record<string, string>[]> => {
    // simple csv parser that returns an array of objects with the header as key (assuming the first row is the header)
    let text = await buffer.text();

    // remove last empty line
    if (text.endsWith("\n")) {
        text = text.slice(0, -1);
    }

    const rows = text.split("\n");
    const headers = rows[0].split(delimiter).map((header) => header.replace(/"/g, "")).map((header) => header.trim());

    // [{header1: value1, header2: value2, ...}, ...]
    const result: Record<string, string>[] = [];


    for (let i = 1; i < rows.length; i++) {

        // get values of each row
        const values = rows[i].split(delimiter);
        if (values.length !== headers.length) {
            throw "Invalid file format";
        }
        const row: Record<string, string> = {};

        for (let j = 0; j < headers.length; j++) {
            row[headers[j]] = values[j].replace(/"/g, "").trim();
        }
        result.push(row);
    }

    return result;
}


export const getHeader = (data: Record<string, string>[]): string[] => {
    // return the header of the csv
    if (data.length === 0) {
        return [];
    }
    return Object.keys(data[0]);
}