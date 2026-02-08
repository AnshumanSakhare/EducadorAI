import { createUploadthing, type FileRouter } from "uploadthing/next";
import sql from "@/lib/db";
import { spawn } from "child_process";
 
const f = createUploadthing();
 
const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function
 
function processPdf(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', ['scripts/process_pdf.py', url]);

    let extractedText = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      extractedText += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      if (code === 0) {
        resolve(extractedText);
      } else {
        reject(new Error(`Python script failed with code ${code}. Stderr: ${errorData}`));
      }
    });

    pythonProcess.on('error', (err) => {
      reject(err);
    });
  });
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({ pdf: { maxFileSize: "16MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const user = await auth(req);
 
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
