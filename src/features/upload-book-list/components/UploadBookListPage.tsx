import SectionBread from "@/components/misc/section-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadBookListForm } from "./UploadBookListForm";

const checklistItems = [
  "Upload a PDF or a clear image of the books you need.",
  "Add your phone number so we can confirm details quickly.",
  "Use your city, school, or delivery area for the location field.",
];

export const UploadBookListPage = () => {
  return (
    <section className="pb-16 pt-8 sm:pt-10 lg:pb-24">
      <SectionBread
        title="Upload Book List"
        description="Send us your list and contact details, and we will review it and follow up with availability."
        bread={[]}
      />

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
          <Card className="rounded-[2rem] border border-border bg-muted/20 shadow-none">
            <CardHeader className="space-y-2 border-b border-border">
              <CardTitle className="text-xl font-semibold tracking-[-0.04em] text-foreground">
                Before you submit
              </CardTitle>
            </CardHeader>
            <CardContent >
              <ul className="space-y-4 text-sm leading-7">
                {checklistItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <UploadBookListForm />
        </div>
      </div>
    </section>
  );
};
