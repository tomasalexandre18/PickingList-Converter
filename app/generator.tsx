"use client";

import {PickingList} from "@/app/Menu";
import {Config} from "@/app/config";
import {useEffect, useMemo} from "react";
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

    const [nbCommandes, users, nbCommandesForUser] = useMemo(() => {
        const orders = new Set<string>();
        const nbCommandesForUser = new Map<string, number>();
        pickingList.forEach((value) => {
            value['In order(s)'].split(' - ').forEach((order) => {
                // remove (quantity) from the order
                const name = order.slice(0, order.lastIndexOf('(') - 1);
                orders.add(name);
                const quantity = Number(order.slice(order.lastIndexOf('(') + 1, order.lastIndexOf(')')));
                if (nbCommandesForUser.has(name)) {
                    nbCommandesForUser.set(name, nbCommandesForUser.get(name)! + quantity);
                } else {
                    nbCommandesForUser.set(name, quantity);
                }
            });
        });
        return [orders.size, orders, nbCommandesForUser];
    }, [pickingList]);

    return (
        <div>
            <div className={'break-after-page mb-[300vh]'}>
                <h1 className={'text-4xl text-center'}>Frais Livré - Commandes</h1>
                <h3 className={'text-2xl text-center'}>Nombre de commandes : {nbCommandes}</h3>
                <div className={'flex justify-center my-5'}>
                    <div className={'w-[50%] h-[100px] border border-black text-center'}>
                        <h2 className={'text-2xl'}>Livraison le :</h2>
                    </div>
                </div>

                <div className={"flex justify-between gap-5"}>
                    <UserTable users={[...users].filter((_, i) => i % 2 === 0)}
                                nbCommandesForUser={nbCommandesForUser}
                    />
                    <UserTable users={[...users].filter((_, i) => i % 2 === 1)}
                               nbCommandesForUser={nbCommandesForUser}
                    />
                </div>
            </div>
            {config.map((cat, i) => {
                return Cat(cat, pickingList, i);
            })}
        </div>
    );
}

function UserTable({users, nbCommandesForUser}: {users: string[], nbCommandesForUser: Map<string, number>}) {
    return (
        <table className={'text-left w-full border-collapse border border-black'}>
            <thead className={'bg-[#1D2939] text-center font-bold text-white'}>
                <tr>
                    <th className={'w-[90%] border-black border'}>Nom</th>
                    <th className={'w-[10%] border-black border'}>Quantité</th>
                </tr>
            </thead>
            <tbody>
                {Array.from(users).map((user, i) => {
                    return (
                        <tr key={i} className={(i % 2 === 1 ? ' bg-[#F2F2F2]' : 'bg-[#E6E6E6]') + ' break-inside-avoid'}>
                            <td className={'border border-black'}>{user}</td>
                            <td className={'border border-black text-center'}>{nbCommandesForUser.get(user)}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
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