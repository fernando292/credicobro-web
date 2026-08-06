import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where
} from "firebase/firestore";


import { db } from "../../../../config/firebase";




export async function createCollectionTracking(

  companyId,

  data

){


  const ref = collection(

    db,

    "companies",

    companyId,

    "collectionTracking"

  );



  await addDoc(

    ref,

    {

      ...data,

      createdAt: serverTimestamp()

    }

  );


}







export async function getCollectionTracking(

  companyId,

  creditId

){


  const ref = collection(

    db,

    "companies",

    companyId,

    "collectionTracking"

  );



  const q = query(

    ref,

    where(

      "creditId",

      "==",

      creditId

    )

  );



  const snapshot = await getDocs(q);



  return snapshot.docs.map(doc => ({


    id:doc.id,


    ...doc.data()


  }));


}