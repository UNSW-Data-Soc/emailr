import { useDropzone } from "react-dropzone";
import { useCallback, useEffect, useState } from "react";
import CSV from "papaparse";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CKEditor, CKEditorContext } from "@ckeditor/ckeditor5-react";
import { ClassicEditor } from "@ckeditor/ckeditor5-editor-classic";
import { Context } from "@ckeditor/ckeditor5-core";
import { Bold, Italic } from "@ckeditor/ckeditor5-basic-styles";
import { Essentials } from "@ckeditor/ckeditor5-essentials";
import { Paragraph } from "@ckeditor/ckeditor5-paragraph";
import { Link } from "@ckeditor/ckeditor5-link";
import { Button } from "./ui/button";
import { ArrowLeftIcon, ArrowRightIcon, SendIcon } from "lucide-react";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "./ui/carousel";

const defaultEmail =
  "<p>Hello {{name}},</p><p>&nbsp;</p><p>Congratulations for joining our peer mentoring program!</p><p>Your mentors will be {{mentor1}} and {{mentor2}} :))</p><p>&nbsp;</p><p>Cheers,</p><p>UNSW DataSoc</p>";
const CSVLabel = <code className="bg-muted px-2 py-1 rounded-md">.csv</code>;

const emailFormSchema = z.object({
  fromName: z.string().min(1).default("UNSW DataSoc"),
  fromEmail: z.string().email().default("hello@unswdata.com"),
  subject: z.string().min(1).default("Hello from DataSoc!"),
  password: z.string().min(1),
});

// replace all {{name}} with csv data
const fillEmailWithCsvData = (emailHTML: string, csvData: Record<string, string>): string => {
  const emailHTMLWithCsvData = emailHTML.replace(/{{(.*?)}}/g, (match, p1) => {
    return csvData[p1] || match;
  });
  return emailHTMLWithCsvData;
};

export default function EmailForm() {
  const [csv, setCsv] = useState<File | null>(null);

  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);

  const [emailKey, setEmailKey] = useState<string>("email");

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      fromName: "UNSW DataSoc",
      fromEmail: "hello@unswdata.com",
      subject: "Hello from DataSoc!",
      password: "",
    },
  });

  const [emailHTML, setEmailHTML] = useState<string>("");

  const [previewCarousel, setPreviewCarousel] = useState<CarouselApi>();
  const [previewCurrent, setPreviewCurrent] = useState<number>(0);

  // when csv is uploaded, parse it
  useEffect(() => {
    if (!csv) return;

    const reader = new FileReader();
    reader.onload = () => {
      const fileContents = reader.result as string;
      const parsedContents: Record<string, string>[] = CSV.parse(fileContents, {
        header: true,
      }).data as Record<string, string>[];
      setCsvData(parsedContents);
    };
    reader.readAsBinaryString(csv);
  }, [csv]);

  // email preview carousel
  useEffect(() => {
    if (!previewCarousel) {
      return;
    }

    setPreviewCurrent(previewCarousel.selectedScrollSnap() + 1);

    previewCarousel.on("select", () => {
      setPreviewCurrent(previewCarousel.selectedScrollSnap() + 1);
    });
  }, [previewCarousel]);

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <h1 className="font-bold text-6xl tracking-tight">DataSoc CSV Emailer</h1>

      {/* csv file dropzone */}
      <CSVDropzone setCsv={setCsv} />

      {/* csv file info */}
      <Section>
        {csv ? (
          <p>
            Current {CSVLabel} file: <code className="font-bold tracking-tight">{csv.name}</code>
          </p>
        ) : (
          <p>No {CSVLabel} uploaded.</p>
        )}
      </Section>

      {/* csv file columns + email column selector */}
      {csvData.length > 0 && (
        <Section>
          <SectionHeading key="columns">CSV Columns:</SectionHeading>
          <div className="flex justify-center gap-4 flex-wrap">
            {Object.keys(csvData[0]).map((name) => (
              <p
                className={cn(
                  `bg-muted px-2 py-1 rounded-md cursor-pointer hover:bg-slate-200 transition-all`,
                  name === emailKey && "bg-blue-200 hover:bg-blue-300"
                )}
                key={name}
                onClick={() => setEmailKey(name)}
              >
                {name}
              </p>
            ))}
          </div>
          {!Object.keys(csvData[0]).includes(emailKey) && (
            <p className="text-red-600 py-2">
              Select the column name that contains the recipients' emails.
            </p>
          )}
          {Object.keys(csvData[0]).includes(emailKey) && (
            <p className="text-blue-600 py-2">
              The column named{" "}
              <code className="font-bold bg-blue-200 px-2 py-1 rounded-md">{emailKey}</code> will be
              used as the email column.
            </p>
          )}
        </Section>
      )}

      {/* email settings form */}
      <Section>
        <SectionHeading>Email Settings</SectionHeading>
        <Form {...emailForm}>
          <form className="grid grid-cols-2 gap-5 items-start py-5">
            <FormField
              control={emailForm.control}
              name="fromName"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start px-3">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={emailForm.control}
              name="fromEmail"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start px-3">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={emailForm.control}
              name="subject"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start px-3">
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={emailForm.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start px-3">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="........" />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </Section>

      {/* email body */}
      <Section>
        <SectionHeading>Email Body</SectionHeading>
        <p>
          Place any variable text inside{" "}
          <code className="px-2 py-1 bg-muted">{"{{csv-column-name}}"}</code>.
        </p>
        {/* <Textarea className="w-full" placeholder="Type your email body here..." /> */}
        <CKEditorContext context={Context}>
          <CKEditor
            editor={ClassicEditor}
            data={defaultEmail}
            config={{
              plugins: [Essentials, Paragraph, Bold, Italic, Link],
              toolbar: {
                items: [
                  "undo",
                  "redo",
                  "|",
                  "heading",
                  "|",
                  "bold",
                  "italic",
                  "|",
                  "link",
                  // "|",
                  // "bulletedList",
                  // "numberedList",
                  // "outdent",
                  // "indent",
                ],
              },
            }}
            onReady={(editor) => {
              setEmailHTML(editor.getData());
            }}
            onChange={(_, editor) => {
              setEmailHTML(editor.getData());
            }}
            onBlur={(_, editor) => {
              setEmailHTML(editor.getData());
            }}
            onFocus={(_, editor) => {
              setEmailHTML(editor.getData());
            }}
          />
        </CKEditorContext>
      </Section>

      {/* email previews */}
      <Section className="relative">
        <SectionHeading>Email Preview</SectionHeading>
        {csv ? (
          <>
            <Carousel setApi={setPreviewCarousel}>
              <CarouselContent>
                {csvData.map((data, index) => (
                  <CarouselItem key={index}>
                    <div
                      className="text-left bg-muted p-5 rounded-lg"
                      dangerouslySetInnerHTML={{ __html: fillEmailWithCsvData(emailHTML, data) }}
                    ></div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <p className="text-slate-400 pt-2">
                Email {previewCurrent} of {csvData.length}
              </p>
            </Carousel>
            <div className="absolute top-3 right-3 flex flex-row gap-2">
              <Button
                className="rounded-full h-7 w-7 p-0"
                disabled={previewCarousel?.canScrollPrev() === false}
                onClick={() => previewCarousel?.scrollPrev()}
              >
                <ArrowLeftIcon size={16} />
              </Button>
              <Button
                className="rounded-full h-7 w-7 p-0"
                disabled={previewCarousel?.canScrollNext() === false}
                onClick={() => previewCarousel?.scrollNext()}
              >
                <ArrowRightIcon size={16} />
              </Button>
            </div>
          </>
        ) : (
          <p className="text-red-600">No CSV uploaded.</p>
        )}
      </Section>

      <div className="flex justify-center flex-row">
        <Button
          className="text-xl flex flex-row gap-2"
          onClick={() => {
            if (!csv) return alert("Please upload a CSV file");
            if (!emailForm.formState.isValid) return alert("Please fill in the email settings");

            fetch(`/.netlify/functions/email`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                fromName: emailForm.getValues("fromName"),
                subject: emailForm.getValues("subject"),
                fromEmail: emailForm.getValues("fromEmail"),
                html: emailHTML,
                csvData: csvData,
                emailCol: emailKey,
                fromPassword: emailForm.getValues("password"),
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                console.log(data);
                alert("Emails sent!");
              })
              .catch((err) => {
                console.error(err);
                alert("Error sending emails");
              });
          }}
        >
          <SendIcon />
          Send Emails
        </Button>
      </div>
    </div>
  );
}

type CSVDropzoneProps = {
  setCsv: React.Dispatch<React.SetStateAction<File | null>>;
};
function CSVDropzone({ setCsv }: CSVDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      if (acceptedFiles[0].type !== "text/csv") return alert("Please upload a CSV file");

      setCsv(acceptedFiles[0]);
    },
    [setCsv]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className="border p-10 rounded-xl border-dashed cursor-pointer bg-white hover:bg-muted transition-all"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the {CSVLabel} file here ...</p>
      ) : (
        <p>Drag 'n' drop a {CSVLabel} file here, or click to select a file</p>
      )}
    </div>
  );
}

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2 border rounded-xl p-3", className)}>{children}</div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-bold text-xl">{children}</h3>;
}
