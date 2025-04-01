
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Star, ArrowUp, ArrowDown, Building, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Property } from '@/types';
import { getSystemSetting } from '@/utils/settingsService';

interface AIPropertyInsightsProps {
  property: Property;
}

const AIPropertyInsights: React.FC<AIPropertyInsightsProps> = ({ property }) => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    // Simulate loading insights data
    setTimeout(() => {
      setInsights({
        score: 87,
        priceComparison: -5,
        occupancyRate: 94,
        amenityScore: 4.2,
        locationScore: 4.5,
        demandTrend: 'increasing',
        similarProperties: 12,
        recommendations: [
          'Consider adding WiFi to increase appeal',
          'Property is priced slightly above market average',
          'High demand in this area for this property type'
        ]
      });
      setLoading(false);
    }, 1500);
  }, [property.id]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
          AI Property Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Property Score</p>
              <p className="text-2xl font-semibold">{insights.score}/100</p>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Price vs. Market</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold">{Math.abs(insights.priceComparison)}%</p>
                {insights.priceComparison > 0 ? (
                  <ArrowUp className="h-4 w-4 ml-1 text-red-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 ml-1 text-green-500" />
                )}
              </div>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Building className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Location Rating</span>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(insights.locationScore) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Amenity Rating</span>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(insights.amenityScore) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Occupancy Rate</span>
            <span className="font-medium">{insights.occupancyRate}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Demand Trend</span>
            <Badge variant="outline" className="capitalize">
              {insights.demandTrend === 'increasing' ? (
                <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {insights.demandTrend}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Similar Properties Nearby</span>
            <span className="font-medium">{insights.similarProperties}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium mb-2">AI Recommendations</h4>
          <ul className="space-y-2">
            {insights.recommendations.map((rec: string, i: number) => (
              <li key={i} className="text-sm flex items-start">
                <Sparkles className="h-3 w-3 mr-2 text-amber-500 mt-1 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIPropertyInsights;
