
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ChevronDown, ChevronUp, PieChart, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchInsightsProps {
  insights: {
    totalResults: number;
    averagePrice: number;
    priceRange: {
      min: number;
      max: number;
    };
    typeDistribution: Record<string, number>;
    topAmenities: string[];
    location: string;
    suggestions: string[];
  };
}

const SearchInsights = ({ insights }: SearchInsightsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!insights) return null;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="pb-3 pt-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center">
          <Sparkles className="h-5 w-5 text-amber-500 mr-2" />
          AI Search Insights
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={toggleExpand} className="h-8 w-8 p-0">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="bg-primary/5">
            {insights.totalResults} results found
          </Badge>
          <Badge variant="outline" className="bg-primary/5">
            Avg. price: ₹{insights.averagePrice.toLocaleString()}
          </Badge>
          <Badge variant="outline" className="bg-primary/5">
            {insights.location}
          </Badge>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border-t pt-3 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <PieChart className="h-4 w-4 mr-1 text-primary" /> Accommodation Types
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(insights.typeDistribution).map(([type, count]) => (
                        <div key={type} className="flex items-center">
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${(count / insights.totalResults) * 100}%` }}
                            ></div>
                          </div>
                          <span className="min-w-[100px] text-right text-sm ml-2">
                            {type} ({count})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-1 text-amber-500" /> Smart Suggestions
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {insights.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2 mt-0.5">
                            {index + 1}
                          </span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Popular Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {insights.topAmenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default SearchInsights;
