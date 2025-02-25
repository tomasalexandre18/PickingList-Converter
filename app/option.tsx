"use client";

import {createContext, useContext, useEffect, useRef, useState} from "react";
import {ModalContext} from "@/app/Modal";
import {exportConfig, importConfig, Config} from "@/app/config";
import {useEventCallback, useIsClient, useLocalStorage} from "usehooks-ts";

interface OptionProps {
    missingCategories: string[]
    setMissingCategories: (value: string[]) => void
    finish: (() => void) | undefined
}

class DataTransfer {
    private readonly data: {[key: string]: unknown} = {};
    constructor() {
        this.data = {};
    }

    setData(name: string, data: unknown) {
        this.data[name] = data;
    }

    getData(name: string) {
        return this.data[name];
    }
}

const dataTransfer = new DataTransfer();
const ConfigContext = createContext<{
    config: Config,
    setConfig: (config: Config) => void,
    missingCategories: string[],
    setMissingCategories: (value: string[]) => void
}>({} as never); // never is used because the context is initialized in the provider

export default function Option({missingCategories, setMissingCategories, finish}: OptionProps) {
    const [showModal, setShowModal] = useState(false);
    const [config, setConfig] = useLocalStorage<Config>("config", []);
    const isClient = useIsClient(); // prevent hydration error of useLocalStorage
    const modal = useContext(ModalContext);

    useEffect(() => {
        modal.setModal(showModal ? <AddCatModal closeModal={() => setShowModal(false)} validate={(catName) => {
            setConfig([...config, {name: catName, subCategory: []}]);
            setShowModal(false);
        }}/> : null);
    }, [showModal]);


    return (<ConfigContext.Provider value={{config, setConfig, missingCategories, setMissingCategories}}>
        <div className={"w-screen h-screen bg-[#F4F3F2] flex-col gap-5 overflow-y-auto relative"}>
            <nav className={"flex items-center justify-between w-full p-5 bg-gray-800 text-gray-100"}>
                <button className={"bg-[#007BFF] text-gray-100 rounded-lg p-2.5"} onClick={() => finish && finish()}>Retour</button>
                <div className={"flex items-center gap-5"}>
                    <button className={"bg-[#007BFF] rounded-lg p-2.5"} onClick={() => setShowModal(true)}>Ajouter une catégorie</button>
                    <div className={"flex items-center gap-2"}>
                        <button className={"bg-green-600 p-2.5 rounded-lg"} onClick={importConfig}>Importer</button>
                        <button className={"bg-red-600 p-2.5 rounded-lg"} onClick={exportConfig}>Exporter</button>
                    </div>
                </div>
            </nav>
            <div className={"relative"}>
                <div className={"flex flex-col gap-5 p-5"}>
                    <div className={"flex justify-evenly gap-5 w-full flex-wrap"}>
                        {isClient && config.map((cat, i) => <div key={i}><Category name={cat.name} subCategories={cat.subCategory} i={i}/></div>)}
                    </div>
                </div>
            </div>
            {missingCategories.length > 0 && <div className={"relative"}>
                <div className={"absolute left-0 bottom-0 w-[150px] h-[150px] animate-pulse text-red-600/50 m-5"}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                         className="bi bi-exclamation-triangle" viewBox="0 0 16 16">
                        <path
                            d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
                        <path
                            d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
                    </svg>
                </div>
                <div className={"absolute right-0 bottom-0 w-[150px] h-[150px] animate-pulse text-red-600/50 m-5"}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                         className="bi bi-exclamation-triangle" viewBox="0 0 16 16">
                        <path
                            d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
                        <path
                            d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
                    </svg>
                </div>
                <div
                    className={"flex items-center justify-start flex-wrap flex-col gap-2 p-5 bg-red-600/50 w-full min-h-[200px]"}>
                    <p className={"text-white block"}>Les sous catégories suivantes n&#39;ont pas été trouvées dans la
                        configuration</p>
                    <div className={"flex flex-wrap gap-2 z-50"}>
                        {missingCategories.map((cat, i) => <div key={i}><MissingSubCategory name={cat}/></div>)}
                    </div>
                </div>
            </div>}
        </div>
    </ConfigContext.Provider>);
}

function Category({name, subCategories, i}: { name: string, subCategories: string[], i: number}) {
    const [over, setOver] = useState(false);
    const {config, setConfig, missingCategories, setMissingCategories} = useContext(ConfigContext);
    const ref = useRef(null);

    const handleOnDragOver = useEventCallback((event: React.DragEvent) => {
        if (dataTransfer.getData("type") === "subCategory" && dataTransfer.getData("catName") !== name) { // add subcategory to category
            event.preventDefault();
            setOver(true);
        }
        if (dataTransfer.getData("type") === "category" && dataTransfer.getData("name") !== name) { // swap categories
            event.preventDefault();
            setOver(true);
        }
        if (dataTransfer.getData("type") === "subCategoryMissing") { // missing subcategory
            event.preventDefault();
            setOver(true);
        }
    });

    const handleOnDragStart = useEventCallback(() => {
        dataTransfer.setData("type", "category");
        dataTransfer.setData("name", name);
        dataTransfer.setData("i", i);
    });

    const handleOnDrop = useEventCallback(() => {
        if (dataTransfer.getData("type") === "subCategory" && dataTransfer.getData("catName") !== name) { // add subcategory to category
            // remove subcategory from previous category
            const cat = config.find((cat) => cat.name === dataTransfer.getData("catName"));
            if (cat) {
                cat.subCategory = cat.subCategory.filter((subCat) => subCat !== dataTransfer.getData("name"));
            }
            // add subcategory to new category
            const newCat = config.find((cat) => cat.name === name);
            if (newCat) {
                newCat.subCategory.push(dataTransfer.getData("name") as string);
            }
            setConfig([...config]);
        }
        if (dataTransfer.getData("type") === "category" && dataTransfer.getData("name") !== name) { // swap categories
            // swap categories
            const temp = config[i];
            config[i] = config[dataTransfer.getData("i") as number];
            config[dataTransfer.getData("i") as number] = temp;
            setConfig(config);
        }
        if (dataTransfer.getData("type") === "subCategoryMissing") { // missing subcategory
            const cat = config.find((cat) => cat.name === name);
            if (cat) {
                cat.subCategory.push(dataTransfer.getData("name") as string);
            }
            setMissingCategories(missingCategories.filter((cat) => cat !== dataTransfer.getData("name")));
            setConfig([...config]);
        }
        setOver(false);
    })

    return (
        <div ref={ref} className={"flex flex-col gap-2 p-5 bg-white rounded-lg shadow-xl w-[300px] h-full"} onDragOver={handleOnDragOver} onDragLeave={() => setOver(false)} style={{border: over ? "2px dashed #007BFF" : "2px solid transparent"}} onDrop={handleOnDrop} draggable onDragStart={handleOnDragStart}>
            <h3 className={"text-xl font-semibold text-gray-900"}>{i+1} - {name}</h3>
            <div className={"flex flex-col gap-1"}>
                {subCategories.map((subCat, i) => <div key={i}><SubCategory name={subCat} catName={name}/></div>)}
            </div>
        </div>
    );
}

function SubCategory({name, catName}: {name: string, catName: string}) {
    const [over, setOver] = useState(false);
    const {config, setConfig} = useContext(ConfigContext);

    const handleOnDragOver = useEventCallback((event: React.DragEvent) => {
        if (dataTransfer.getData("type") === "subCategory" && dataTransfer.getData("catName") == catName && dataTransfer.getData("name") !== name) {
            event.preventDefault();
            setOver(true);
        }
    });

    const handleOnDrop = useEventCallback((event: React.DragEvent) => {
        event.preventDefault();
        setOver(false);
        if (dataTransfer.getData("type") === "subCategory" && dataTransfer.getData("catName") == catName) {
            const cat = config.find((cat) => cat.name === catName);
            if (cat) {
                const index = [cat.subCategory.indexOf(dataTransfer.getData("name") as string), cat.subCategory.indexOf(name)];
                // swap subcategories
                const temp = cat.subCategory[index[0]];
                cat.subCategory[index[0]] = cat.subCategory[index[1]];
                cat.subCategory[index[1]] = temp;
                setConfig([...config]);
            }
        }
    });

    const handleOnDragStart = useEventCallback((event: React.DragEvent) => {
        dataTransfer.setData("type", "subCategory");
        dataTransfer.setData("name", name);
        dataTransfer.setData("catName", catName);
        event.stopPropagation();
    });

    return (
        <div className={"flex items-center gap-2 cursor-pointer"} draggable onDragStart={handleOnDragStart} onDragOver={handleOnDragOver} onDragLeave={() => setOver(false)} onDrop={handleOnDrop} style={{border: over ? "2px dashed #007BFF" : "2px solid transparent"}}>
            <div className={"w-2 h-2 bg-gray-900 rounded-full"}/>
            <p className={"text-gray-900"}>{name}</p>
        </div>
    );
}

function MissingSubCategory({name}: {name: string}) {

    // handleOnDragStart
    const handleOnDragStart = useEventCallback((event: React.DragEvent) => {
        dataTransfer.setData("type", "subCategoryMissing");
        dataTransfer.setData("name", name);
        event.stopPropagation();
    });

    return (
        <div className={"flex items-center gap-2 bg-white p-2 rounded-lg"} draggable onDragStart={handleOnDragStart}>
            <div className={"w-2 h-2 bg-red-500 rounded-full"}/>
            <p className={"text-black"}>{name}</p>
        </div>
    );
}



function AddCatModal({closeModal, validate}: {closeModal: () => void, validate: (catName: string) => void}) {
    const [catName, setCatName] = useState("");

    return(
        <div className={"fixed top-0 left-0 w-screen h-screen bg-gray-900/50 flex items-center justify-center flex-col gap-5 bg-opacity-20"} onClick={closeModal}>
            <div className={"bg-white rounded-2xl flex flex-col gap-2 w-[90%] min-w-[300px] max-w-[500px]"} onClick={(e) => e.stopPropagation()}>
                {/* HEAD */}
                <div className={"flex items-center justify-between w-full border-b border-gray-200 p-5"}>
                    <h3 className={"text-xl font-semibold text-gray-900"}>Ajouter une catégorie</h3>
                    <button className="end-2.5 text-gray-400 bg-transparent rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center hover:bg-gray-200" onClick={closeModal}>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                    </button>
                </div>
                {/* BODY */}
                <form className={"p-5 pt-1 w-full space-y-4"} onSubmit={(e) => {
                    e.preventDefault();
                    validate(catName);
                }}>
                    <div>
                        <label htmlFor={"catName"} className={"block text-sm text-gray-900"}>
                            Nom de la catégorie
                        </label>
                        <input required type="text" className={"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:outline-none focus:border-blue-500"} id={"catName"} value={catName} onChange={(e) => setCatName(e.target.value)}/>
                    </div>
                    <button type="submit" className={"bg-[#007BFF] text-white rounded-lg p-2.5 w-full shadow-xl hover:bg-[#0056B3] transition duration-300"}>Ajouter</button>
                </form>
            </div>
        </div>
    );
}
