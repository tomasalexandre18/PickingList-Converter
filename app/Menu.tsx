"use client";
import {useCallback, useState} from "react";
import {readCsv, getHeader} from "@/app/csv";

const pickingListHeader = [
    "Name",
    "Quantity",
    "Catégorie",
    "In order(s)"
];

export interface PickingList {
    Name: string;
    Quantity: number;
    Catégorie: string;
    "In order(s)": string;
}

interface MenuProps {
    onFileSelected: (pickingList: PickingList[]) => void;
    onConfigEdit: () => void;
}

let lastError: string = "No error";
let handleTimeout: NodeJS.Timeout | null = null;


export function Menu({onFileSelected, onConfigEdit}: MenuProps) {
    const [error, sE] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const setError = useCallback((message: string) => {
        sE(message);
        lastError = message;
        if (handleTimeout) {
            clearTimeout(handleTimeout);
        }
        handleTimeout = setTimeout(() => {
            sE(null);
        }, 5000);
    }, []);

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        setLoading(true);
        const files = event.target.files;
        // check if a file is selected
        if (files && files.length > 0) {
            const file = files[0];

            // check if user force a bad file format
            if (!file.name.endsWith(".csv")) {
                setError("Format de fichier invalide");
                setLoading(false);
                return;
            }

            // read the file as csv and check if the header matches the expected header
            const data = await readCsv(file, ";").catch(() => {
                setError("Format de fichier invalide");
                setLoading(false);
                return [];
            });

            if (data.length > 0) {
                const header = getHeader(data);
                if (header.length === pickingListHeader.length && header.every((value, index) => value === pickingListHeader[index])) {
                    onFileSelected(data as unknown as PickingList[]);
                    setLoading(false);
                } else {
                    setError("Entête de fichier invalide");
                    setLoading(false);
                }
            }
        }
        setLoading(false);
    }, [onFileSelected, setError]);

    return (
        <>
            <div className={"flex flex-col items-center justify-center h-screen bg-[#F4F3F2] gap-5 w-screen"}>
                <div className={"flex gap-3 flex-col items-center justify-center bg-[#FFFEFD] p-5 rounded-[25px] shadow-xl"}>
                    <h1 className={"text-4xl font-bold"}>Poisson Livreur - Picking List</h1>
                    <input type="file" accept=".csv" className={"hidden"} id={"file"} onChange={async (event) => {await handleFileChange(event); event.target.value = "";}}/>
                    <label htmlFor="file"
                           className={"w-full bg-[#007BFF] text-white rounded-lg cursor-pointer hover:bg-[#0056B3] transition duration-300 shadow border-dashed border-[5px] border-[#89ADFF] h-[150px]"}>
                        <div className={"flex flex-col items-center justify-center gap-3 relative w-full h-full"}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor"
                                 className="bi bi-filetype-csv absolute top-[30px]" viewBox="0 0 16 16"
                                 style={{visibility: loading ? "hidden" : "visible"}}>
                                <path fill-rule="evenodd"
                                      d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM3.517 14.841a1.13 1.13 0 0 0 .401.823q.195.162.478.252.284.091.665.091.507 0 .859-.158.354-.158.539-.44.187-.284.187-.656 0-.336-.134-.56a1 1 0 0 0-.375-.357 2 2 0 0 0-.566-.21l-.621-.144a1 1 0 0 1-.404-.176.37.37 0 0 1-.144-.299q0-.234.185-.384.188-.152.512-.152.214 0 .37.068a.6.6 0 0 1 .246.181.56.56 0 0 1 .12.258h.75a1.1 1.1 0 0 0-.2-.566 1.2 1.2 0 0 0-.5-.41 1.8 1.8 0 0 0-.78-.152q-.439 0-.776.15-.337.149-.527.421-.19.273-.19.639 0 .302.122.524.124.223.352.367.228.143.539.213l.618.144q.31.073.463.193a.39.39 0 0 1 .152.326.5.5 0 0 1-.085.29.56.56 0 0 1-.255.193q-.167.07-.413.07-.175 0-.32-.04a.8.8 0 0 1-.248-.115.58.58 0 0 1-.255-.384zM.806 13.693q0-.373.102-.633a.87.87 0 0 1 .302-.399.8.8 0 0 1 .475-.137q.225 0 .398.097a.7.7 0 0 1 .272.26.85.85 0 0 1 .12.381h.765v-.072a1.33 1.33 0 0 0-.466-.964 1.4 1.4 0 0 0-.489-.272 1.8 1.8 0 0 0-.606-.097q-.534 0-.911.223-.375.222-.572.632-.195.41-.196.979v.498q0 .568.193.976.197.407.572.626.375.217.914.217.439 0 .785-.164t.55-.454a1.27 1.27 0 0 0 .226-.674v-.076h-.764a.8.8 0 0 1-.118.363.7.7 0 0 1-.272.25.9.9 0 0 1-.401.087.85.85 0 0 1-.478-.132.83.83 0 0 1-.299-.392 1.7 1.7 0 0 1-.102-.627zm8.239 2.238h-.953l-1.338-3.999h.917l.896 3.138h.038l.888-3.138h.879z"/>
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor"
                                 className="bi bi-hand-index absolute bottom-[10px] left-[calc(50%+15px)] m-2 text-white animate-pulse -rotate-45"
                                 style={{visibility: loading ? "hidden" : "visible"}}
                                 viewBox="0 0 16 16">
                                <path
                                    d="M6.75 1a.75.75 0 0 1 .75.75V8a.5.5 0 0 0 1 0V5.467l.086-.004c.317-.012.637-.008.816.027.134.027.294.096.448.182.077.042.15.147.15.314V8a.5.5 0 1 0 1 0V6.435l.106-.01c.316-.024.584-.01.708.04.118.046.3.207.486.43.081.096.15.19.2.259V8.5a.5.5 0 0 0 1 0v-1h.342a1 1 0 0 1 .995 1.1l-.271 2.715a2.5 2.5 0 0 1-.317.991l-1.395 2.442a.5.5 0 0 1-.434.252H6.035a.5.5 0 0 1-.416-.223l-1.433-2.15a1.5 1.5 0 0 1-.243-.666l-.345-3.105a.5.5 0 0 1 .399-.546L5 8.11V9a.5.5 0 0 0 1 0V1.75A.75.75 0 0 1 6.75 1M8.5 4.466V1.75a1.75 1.75 0 1 0-3.5 0v5.34l-1.2.24a1.5 1.5 0 0 0-1.196 1.636l.345 3.106a2.5 2.5 0 0 0 .405 1.11l1.433 2.15A1.5 1.5 0 0 0 6.035 16h6.385a1.5 1.5 0 0 0 1.302-.756l1.395-2.441a3.5 3.5 0 0 0 .444-1.389l.271-2.715a2 2 0 0 0-1.99-2.199h-.581a5 5 0 0 0-.195-.248c-.191-.229-.51-.568-.88-.716-.364-.146-.846-.132-1.158-.108l-.132.012a1.26 1.26 0 0 0-.56-.642 2.6 2.6 0 0 0-.738-.288c-.31-.062-.739-.058-1.05-.046zm2.094 2.025"/>
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor"
                                 className="bi bi-circle animate-ping" viewBox="0 0 16 16" style={{visibility: loading ? "visible" : "hidden"}}>
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                            </svg>
                        </div>
                    </label>
                    <button disabled={loading}
                            className={"w-full p-2 bg-[#28A745] text-white rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#218838] transition duration-300 shadow gap-1"}
                            onClick={onConfigEdit}>
                        Option
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                             className="bi bi-gear-wide-connected" viewBox="0 0 16 16">
                            <path
                                d="M7.068.727c.243-.97 1.62-.97 1.864 0l.071.286a.96.96 0 0 0 1.622.434l.205-.211c.695-.719 1.888-.03 1.613.931l-.08.284a.96.96 0 0 0 1.187 1.187l.283-.081c.96-.275 1.65.918.931 1.613l-.211.205a.96.96 0 0 0 .434 1.622l.286.071c.97.243.97 1.62 0 1.864l-.286.071a.96.96 0 0 0-.434 1.622l.211.205c.719.695.03 1.888-.931 1.613l-.284-.08a.96.96 0 0 0-1.187 1.187l.081.283c.275.96-.918 1.65-1.613.931l-.205-.211a.96.96 0 0 0-1.622.434l-.071.286c-.243.97-1.62.97-1.864 0l-.071-.286a.96.96 0 0 0-1.622-.434l-.205.211c-.695.719-1.888.03-1.613-.931l.08-.284a.96.96 0 0 0-1.186-1.187l-.284.081c-.96.275-1.65-.918-.931-1.613l.211-.205a.96.96 0 0 0-.434-1.622l-.286-.071c-.97-.243-.97-1.62 0-1.864l.286-.071a.96.96 0 0 0 .434-1.622l-.211-.205c-.719-.695-.03-1.888.931-1.613l.284.08a.96.96 0 0 0 1.187-1.186l-.081-.284c-.275-.96.918-1.65 1.613-.931l.205.211a.96.96 0 0 0 1.622-.434zM12.973 8.5H8.25l-2.834 3.779A4.998 4.998 0 0 0 12.973 8.5m0-1a4.998 4.998 0 0 0-7.557-3.779l2.834 3.78zM5.048 3.967l-.087.065zm-.431.355A4.98 4.98 0 0 0 3.002 8c0 1.455.622 2.765 1.615 3.678L7.375 8zm.344 7.646.087.065z"></path>
                        </svg>
                    </button>
                </div>
                <p className={"bg-red-500 text-white p-2 rounded-lg font-bold transition" + (error ? " opacity-100 animate-bounce" : " opacity-0")}>{lastError}</p>
            </div>
        </>
    );
}
