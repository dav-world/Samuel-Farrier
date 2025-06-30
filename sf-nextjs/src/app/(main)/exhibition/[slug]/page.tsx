import ExhibitionDetailRealtime from "./ExhibitiondetailRealtime";

export default function Page({ params }: { params: { slug: string } }) {
  return <ExhibitionDetailRealtime slug={params.slug} />;
}