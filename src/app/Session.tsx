"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { supabase } from "./supabase-client";

function Session() {
  const router = useRouter();
  const supabaseClient = createClientComponentClient();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          router.push("/signin");
        } else if (event === "SIGNED_IN") {
          router.refresh();
        }
        setSession(session);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [router, supabaseClient.auth]);

  return (
    <>
      <>{JSON.stringify(session)}</>
      {session ? <div>Signed In</div> : <div>Not Signed In</div>}
    </>
  );
}

export default Session;
