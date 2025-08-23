import { ExternalLink, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Paper } from "@shared/schema";

interface PaperCardProps {
  paper: Paper;
}

export function PaperCard({ paper }: PaperCardProps) {
  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'arxiv':
        return 'bg-primary-100 text-primary-700';
      case 'medrxiv':
        return 'bg-green-100 text-green-700';
      case 'biorxiv':
        return 'bg-blue-100 text-blue-700';
      case 'pmc':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'arxiv':
        return 'arXiv';
      case 'medrxiv':
        return 'medRxiv';
      case 'biorxiv':
        return 'bioRxiv';
      case 'pmc':
        return 'PMC';
      default:
        return source;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const handleShare = () => {
    // TODO: Implement sharing functionality
    if (navigator.share) {
      navigator.share({
        title: paper.title,
        text: paper.abstract.substring(0, 100) + '...',
        url: paper.url,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(paper.url);
    }
  };

  return (
    <article 
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6"
      data-testid={`card-paper-${paper.id}`}
    >
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
        <div className="flex-1 lg:pr-6">
          {/* Source Badge */}
          <div className="flex items-center space-x-2 mb-3">
            <Badge className={`text-xs font-medium ${getSourceBadgeColor(paper.source)}`}>
              {getSourceLabel(paper.source)}
            </Badge>
            {paper.category && (
              <>
                <span className="text-xs text-gray-500">{paper.category}</span>
                <span className="text-xs text-gray-400">•</span>
              </>
            )}
            <span className="text-xs text-gray-500">
              Published {formatDate(paper.publishedDate)}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 cursor-pointer transition-colors">
            <a 
              href={paper.url} 
              target="_blank" 
              rel="noopener noreferrer"
              data-testid={`link-paper-title-${paper.id}`}
            >
              {paper.title}
            </a>
          </h4>

          {/* Authors */}
          {paper.authors.length > 0 && (
            <p className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Authors:</span> {paper.authors.join(', ')}
            </p>
          )}

          {/* Abstract */}
          <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
            {paper.abstract}
          </p>

          {/* DOI and Keywords */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            {paper.doi && <span>DOI: {paper.doi}</span>}
            {paper.pmid && <span>PMID: {paper.pmid}</span>}
            {paper.arxivId && <span>arXiv: {paper.arxivId}</span>}
            
            {paper.keywords.length > 0 && (
              <>
                <span>•</span>
                <div className="flex flex-wrap gap-1">
                  {paper.keywords.slice(0, 3).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex lg:flex-col space-x-3 lg:space-x-0 lg:space-y-2">
          <Button 
            asChild
            className="bg-primary-500 hover:bg-primary-600"
            size="sm"
            data-testid={`button-view-paper-${paper.id}`}
          >
            <a href={paper.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Paper
            </a>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleShare}
            data-testid={`button-share-${paper.id}`}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </article>
  );
}
