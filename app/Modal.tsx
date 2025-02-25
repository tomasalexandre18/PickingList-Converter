import {createContext} from "react";

export const ModalContext = createContext<{
    setModal: (modal: React.ReactNode) => void
}>({
    setModal: () => {},
});

