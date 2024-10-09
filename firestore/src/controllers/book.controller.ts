import { NextFunction, Request, Response } from "express";
import { firebase } from "../firebase";

import { addDoc, collection, getDocs, getFirestore, query, where } from "firebase/firestore";

const db = getFirestore(firebase);

export const createBook = async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    try {
        const bookRefs = collection(db, "books");
        const q = query(bookRefs, where("name", "==", data.name));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            res.status(409).send("Book already exists with this name");
        } else {
            const create = await addDoc(collection(db, "books"), data);
            if (create) {
                res.status(201).send("Book created successfully");
            } else {
                res.status(500).send("Failed to create book");
            }
        }
    } catch (err) {
        res.status(500).send((err as Error).message);
    }
};
