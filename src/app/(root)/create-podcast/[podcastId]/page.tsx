export default function PodcastPage({params}: {params: {podcastId: string}}) {
  return (
    <section className="text-white-1">Podcast for {params.podcastId}</section>
  )
}
