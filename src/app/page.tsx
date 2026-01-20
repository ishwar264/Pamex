import DataCollectionForm from "@/components/DataCollectionForm";

export default function Home() {
  return (
    <main className="h-screen w-screen gradient-bg flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto px-4 py-1 md:px-8 md:py-2 overflow-hidden">
        <div className="mb-2 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-primary">
            INDASANALYTICS LLP
          </h1>
          <p className="text-muted-foreground text-xs">
            Smart Data Collection Portal
          </p>
        </div>
        <div className="flex-1 overflow-auto">
          <DataCollectionForm />
        </div>
      </div>
    </main>
  );
}
