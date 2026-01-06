import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for seed key
    const url = new URL(req.url);
    const seedKey = url.searchParams.get("key");
    if (seedKey !== "init-library-2024") {
      return new Response(
        JSON.stringify({ error: "Invalid seed key" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if librarian already exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("role", "librarian")
      .maybeSingle();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ message: "Librarian account already exists" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Create auth user for librarian
    const librarianEmail = "librarian@itlibrary.local";
    const librarianPassword = "ITLibrarian@123";

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: librarianEmail,
      password: librarianPassword,
      email_confirm: true,
    });

    if (authError) {
      throw authError;
    }

    // Create librarian profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authUser.user.id,
        name: "Deepika",
        phone: "0000000000",
        role: "librarian",
        roll_or_faculty_id: "Deepika@123",
        status: "active",
      });

    if (profileError) {
      // Cleanup auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw profileError;
    }

    return new Response(
      JSON.stringify({ 
        message: "Librarian account created successfully",
        credentials: {
          username: "Deepika@123",
          password: "ITLibrarian@123"
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
