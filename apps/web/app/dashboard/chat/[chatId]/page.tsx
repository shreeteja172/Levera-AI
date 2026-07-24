import { DashboardChat } from "../../components/dashboard-chat";

type Params = Promise<{ chatId: string }>;

interface PageProps {
  params: Params;
}

export default async function Page({ params }: PageProps) {
  const { chatId } = await params;
  return <DashboardChat chatId={chatId} />;
}
