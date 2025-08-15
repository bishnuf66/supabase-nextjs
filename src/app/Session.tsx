"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase-client";

function Session() {
  const [session, setSession] = useState<any>(null);
  const fetchSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log("error fetching session", error);
    }
    console.log(data);
    setSession(data.session);
  };

  useEffect(() => {
    fetchSession();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });
    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <>
      <>{JSON.stringify(session)}</>
      {session ? <div>Signed In</div> : <div>Not Signed In</div>}
    </>
  );
}

export default Session;
