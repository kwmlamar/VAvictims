import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { seedDatabase, clearDatabase } from '@/lib/seedDatabase';

const DatabaseSeeder = () => {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const result = await seedDatabase();
      if (result.success) {
        toast({
          title: "Database Seeded",
          description: "Sample data has been successfully added to the database.",
          duration: 3000,
        });
      } else {
        toast({
          title: "Seeding Failed",
          description: "Failed to seed database. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error seeding database:', error);
      toast({
        title: "Error",
        description: "An error occurred while seeding the database.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }
    
    setIsClearing(true);
    try {
      const result = await clearDatabase();
      if (result.success) {
        toast({
          title: "Database Cleared",
          description: "All data has been successfully removed from the database.",
          duration: 3000,
        });
      } else {
        toast({
          title: "Clear Failed",
          description: "Failed to clear database. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error clearing database:', error);
      toast({
        title: "Error",
        description: "An error occurred while clearing the database.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="ios-card p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white">Database Management</h3>
      <p className="text-blue-200 text-sm">
        Use these buttons to populate or clear the database with sample data for testing.
      </p>
      
      <div className="flex space-x-4">
        <Button
          onClick={handleSeedDatabase}
          disabled={isSeeding}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSeeding ? 'Seeding...' : 'Seed Database'}
        </Button>
        
        <Button
          onClick={handleClearDatabase}
          disabled={isClearing}
          variant="destructive"
        >
          {isClearing ? 'Clearing...' : 'Clear Database'}
        </Button>
      </div>
      
      <div className="text-xs text-blue-300 space-y-1">
        <p><strong>Seed Database:</strong> Adds sample VISNs, facilities, scorecards, complaints, and representatives</p>
        <p><strong>Clear Database:</strong> Removes all data except system records</p>
      </div>
    </div>
  );
};

export default DatabaseSeeder; 