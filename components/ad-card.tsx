interface AdCardProps {
  brandName: string
  content: string
  imageUrl?: string
}

export function AdCard({ brandName, content, imageUrl }: AdCardProps) {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        {imageUrl && (
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <span role="img" aria-label="baby" className="text-lg">
              👶
            </span>
          </div>
        )}
        <span className="font-medium">{brandName}</span>
      </div>
      <p className="text-sm">{content}</p>
      <div className="text-xs text-right mt-2 text-muted-foreground">Sponsored</div>
    </div>
  )
}
