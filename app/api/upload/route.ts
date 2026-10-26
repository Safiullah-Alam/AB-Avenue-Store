import { NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: "Supabase credentials are not configured" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    const allFiles: File[] = [];
    if (singleFile) allFiles.push(singleFile);
    if (files && files.length > 0) {
      files.forEach((f) => {
        if (!allFiles.includes(f)) allFiles.push(f);
      });
    }

    if (allFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    const uploadedUrls: string[] = [];

    for (const file of allFiles) {
      // Create safe filename
      const originalName = file.name || "image.jpg";
      const cleanName = originalName
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, "-")
        .replace(/-+/g, "-");
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      const fileName = `${timestamp}_${randomSuffix}_${cleanName}`;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const mimeType = file.type || "image/jpeg";

      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        console.error("Supabase storage upload error:", error);
        return NextResponse.json(
          { success: false, error: `Upload error: ${error.message}` },
          { status: 500 }
        );
      }

      const { data: pubData } = supabase.storage
        .from("product-images")
        .getPublicUrl(data.path);

      uploadedUrls.push(pubData.publicUrl);
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0],
      urls: uploadedUrls,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("Upload API error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
