"use client";

import {PickingList} from "@/app/Menu";
import {Config} from "@/app/config";
import {useEffect} from "react";
import {useLocalStorage} from "usehooks-ts";

interface GeneratorProps {
    pickingList: PickingList[];
    finish: (() => void) | undefined;
}

export default function Generator({pickingList, finish = undefined}: GeneratorProps) {
    // Convert the picking list to a printable format using the configuration
    const [config] = useLocalStorage<Config>('config', []);

    useEffect(() => {
        // when the user print the page, we call the finish function
        const callback = () => {
            if (finish) {
                finish();
            }
        };
        window.addEventListener('afterprint', callback);
        return () => {
            window.removeEventListener('afterprint', callback);
        };
    }, [finish]);

    useEffect(() => {
        // print the page when the component is rendered
        const id = setTimeout(() => { // skip double print with react StrictMode
            window.print();
        }, 10);
        return () => {
            clearTimeout(id);
        }
    }, []);

    return (
        <div>
            {config.map((cat, i) => {
                return Cat(cat, pickingList, i);
            })}
        </div>
    );
}


function Cat(cat: Config[0], values: PickingList[], i: number = 0) {
    if (cat.subCategory.filter((subCat) => values.filter((value) => value.Catégorie === subCat).length > 0).length === 0) {
        return null;
    }
    return (
        <div className={"break-after-page text-center"} key={i}>
            <h1 className={'text-3xl'}>{cat.name}</h1>
            {cat.subCategory.map((subCat, i) => {
                return SubCat(subCat, values, i);
            })}
        </div>
    );
}

function SubCat(subCat: string, values: PickingList[], i: number = 0) {
    if (values.filter((value) => value.Catégorie === subCat).length === 0) {
        return null;
    }
    return (
        <div key={i}>
            <h2 className={'text-2xl mt-2 mb-2'}>{subCat}</h2>
            <div className={'rounded-t-2xl overflow-hidden'}>
                <table className={'text-left w-full border-collapse border border-black'}>
                    <thead className={'bg-[#1D2939] text-center font-bold text-white'}>
                        <tr>
                            <th className={'w-[50%] border-black border'}>Nom</th>
                            <th className={'w-[10%] border-black border'}>Quantité</th>
                            <th className={'w-[40%] border-black border'}>Commandes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {values.filter((value) => value.Catégorie === subCat).map((value, i) => {
                            const splited = value['In order(s)'].split(' - ');
                            return (
                                <tr key={i} className={(i % 2 === 1 ? ' bg-[#F2F2F2]' : 'bg-[#E6E6E6]') + ' break-inside-avoid'}>
                                    <td className={'border border-black'}>{value.Name}</td>
                                    <td className={'border border-black text-center'}>{value.Quantity}</td>
                                    <td className={'border border-black'}>{splited.map((order, j) => {
                                        return (
                                            <span key={j} style={{whiteSpace: "nowrap"}}>{order}<br/></span>
                                        );
                                    })}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}