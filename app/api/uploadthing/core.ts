import { createUploadthing, type FileRouter } from "uploadthing/next";
import sql from "@/lib/db";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
 
const f = createUploadthing();
 
const auth = () => ({ id: "fakeId" }); // Fake auth function
 
async function processPdf(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download PDF (${res.status} ${res.statusText})`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const dataBuffer = Buffer.from(arrayBuffer);

  const parsed = await pdfParse(dataBuffer);
  return parsed.text ?? "";
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({ pdf: { maxFileSize: "16MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      const user = await auth();
 
      // If you throw, the user will not be able to upload
      if (!user) throw new Error("Unauthorized");
 
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);
      try {
        const extractedText = await processPdf(file.ufsUrl);
        if (extractedText.trim().length > 0) {
          await sql`
            INSERT INTO Documents (file_name, text)
            VALUES (${file.name}, ${extractedText});
          `;
          console.log('Saved extracted text to the database.');
        } else {
          console.warn('Python script executed successfully but produced no text.');
        }
      } catch (error) {
        console.error('Error processing PDF or saving to database:', error);
        throw new Error('Failed to process PDF after upload.');
      }
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;
