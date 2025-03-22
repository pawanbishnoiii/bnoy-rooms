
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, RefreshCw, Star, MapPin, Building } from 'lucide-react';
import { Property } from '@/types';
import { getAIRecommendations } from '@/utils/googleAI';
import PropertyCard from '@/components/home/PropertyCard';

interface AIRecommendationsProps {
  userPreferences?: {
    gender?: 'boys' | 'girls' | 'common';
    budget?: number;
    amenities?: string[];
    location?: string;
    propertyType?: string;
  };
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ userPreferences }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user, userPreferences]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const result = await getAIRecommendations({
        userPreferences,
        limit: 4
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Transform the data to match our Property interface
      const transformedData: Property[] = (result.data || []).map((item: any) => ({
        ...item,
        // Ensure all required fields from the Property interface are present
        location: item.location ? {
          id: item.location.id || '',
          name: item.location.name || '',
          latitude: item.location.latitude || null,
          longitude: item.location.longitude || null,
          created_at: item.location.created_at || '',
        } : undefined,
        facilities: item.facilities?.map((f: any) => ({
          id: f.id || '',
          name: f.name || '',
          created_at: f.created_at || '',
        })) || [],
        images: item.images?.map((img: any) => ({
          id: img.id || '',
          property_id: img.property_id || item.id,
          image_url: img.image_url || '',
          is_primary: img.is_primary || false,
          created_at: img.created_at || '',
        })) || [],
      }));

      setRecommendations(transformedData);

      // Generate AI insights
      if (transformedData.length > 0) {
        const insights = [
          `Found ${transformedData.length} properties matching your preferences`,
          userPreferences?.gender ? `Optimized for ${userPreferences.gender} accommodation` : null,
          userPreferences?.budget ? `Within your budget of ₹${userPreferences.budget}` : null,
          userPreferences?.location ? `Located in or near ${userPreferences.location}` : null,
          transformedData.some(p => p.average_rating && p.average_rating >= 4) ? 'Includes highly-rated properties' : null,
          userPreferences?.amenities?.length ? `With requested amenities: ${userPreferences.amenities.slice(0, 3).join(', ')}${userPreferences.amenities.length > 3 ? ' and more' : ''}` : null
        ].filter(Boolean) as string[];
        
        setAiInsights(insights);
      }
    } catch (error: any) {
      console.error('Error fetching AI recommendations:', error);
      toast({
        title: 'Could not load recommendations',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 text-amber-500 mr-2" />
            <CardTitle>AI-Powered Recommendations</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchRecommendations}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <CardDescription>
          Personalized property suggestions based on your preferences and search history
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-background rounded-xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <>
            {/* AI Insights */}
            {aiInsights.length > 0 && (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <h4 className="flex items-center text-sm font-medium mb-2">
                  <Sparkles className="h-4 w-4 text-amber-500 mr-1" />
                  AI Insights
                </h4>
                <ul className="text-sm space-y-1">
                  {aiInsights.map((insight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map(property => (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  name={property.name}
                  type={property.type}
                  location={property.location?.name || property.address || ''}
                  price={property.monthly_price}
                  rating={property.average_rating || 4.5}
                  reviewCount={12} // Mock data
                  image={property.images?.[0]?.image_url || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3"}
                  facilities={property.facilities?.map(f => f.name) || []}
                  distance="1.2 km" // Mock data
                  isVerified={property.is_verified}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">No recommendations available</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or browse more properties to receive personalized suggestions
            </p>
          </div>
        )}

        {userPreferences && Object.keys(userPreferences).some(key => userPreferences[key as keyof typeof userPreferences]) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Based on:</span>
            {userPreferences.gender && (
              <Badge variant="outline" className="text-xs">
                {userPreferences.gender === 'boys' ? 'Boys' : 
                 userPreferences.gender === 'girls' ? 'Girls' : 'Common'} accommodation
              </Badge>
            )}
            {userPreferences.budget && (
              <Badge variant="outline" className="text-xs">
                Budget: ₹{userPreferences.budget.toLocaleString()}
              </Badge>
            )}
            {userPreferences.location && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {userPreferences.location}
              </Badge>
            )}
            {userPreferences.propertyType && (
              <Badge variant="outline" className="text-xs">
                <Building className="h-3 w-3 mr-1" />
                {userPreferences.propertyType}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecommendations;
