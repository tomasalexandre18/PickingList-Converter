"use client";

import {Menu, PickingList} from "@/app/Menu";
import {Suspense, useCallback, useState} from "react";
import {checkCat} from "@/app/checkCat";
import Generator from "@/app/generator";
import Option from "@/app/option";
import {useLocalStorage} from "usehooks-ts";
import {ModalContext} from "@/app/Modal";

export default function App() {
    const [pickingList, setPickingList] = useState<PickingList[]>([]);
    const [state, setState] = useState(0); // 0: menu, 1: configuration, 2: PDF generation
    const [missingCategories, setMissingCategories] = useState<string[]>([]); // List of missing categories in the configuration
    const [modal, setModal] = useState<React.ReactNode | null>(null);
    const [config] = useLocalStorage("config", []);


    const handleMenuOnFileSelected = useCallback((pL: PickingList[]) => {
        // Check if all the sub categories are in the configuration
        const missing = checkCat([...new Set(pL.map((pl) => pl.Catégorie))], config);
        if (missing.length > 0) {
            console.log("Missing categories", missing);
            setMissingCategories(missing);
            setState(1);
            return;
        }
        setPickingList(pL);
        setState(2);
    }, [config]);

    return (
        <>
            <ModalContext.Provider value={{setModal}}>
                {state != 2 &&
                    <div className={"flex items-center justify-start h-screen w-[200vw] transition duration-1000"} style={{transform: `translateX(-${state * 100}vw)`}}>
                        <Menu onFileSelected={handleMenuOnFileSelected} onConfigEdit={() => {setState(1);}}/>
                        <Suspense fallback={<div className={"w-screen h-screen bg-[#F4F3F2] flex items-center justify-center text-3xl"}>Loading...</div>}>
                            <Option missingCategories={missingCategories} setMissingCategories={setMissingCategories} finish={() => setState(0)}/>
                        </Suspense>
                    </div>
                }
                {state == 2 && <Generator pickingList={pickingList} finish={() => setState(0)}/>}
            </ModalContext.Provider>
            {modal}
        </>
    );
}