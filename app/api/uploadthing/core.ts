import { createUploadthing, type FileRouter } from "uploadthing/next";
import sql from "@/lib/db";
 
const f = createUploadthing();
 
const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function
 
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

      const processPdf = () =>
        new Promise<string>(async (resolve, reject) => {
          const { spawn } = await import('child_process');
          const pythonProcess = spawn('python', ['scripts/process_pdf.py', file.ufsUrl]);

          let extractedText = '';
          pythonProcess.stdout.on('data', (data) => {
            extractedText += data.toString();
          });

          let errorData = '';
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

      try {
        const extractedText = await processPdf();
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
