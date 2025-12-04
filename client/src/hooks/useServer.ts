"use client";

import { isServer as IsServer } from "@/lib";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const useServer = (): [boolean, Dispatch<SetStateAction<boolean>>] => {
  const [isServer, setIsServer] = useState(IsServer);

  useEffect(() => {
    if (isServer) {
      setIsServer(false);
    }
    return () => {};
  }, []);

  return [isServer, setIsServer];
};

export default useServer;
