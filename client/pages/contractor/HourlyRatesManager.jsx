import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getHourlyRates, updateHourlyRates } from '@/lib/db_time_tracking';
import { supabase } from '@/lib/customSupabaseClient';
import { Save, DollarSign } from 'lucide-react';

const HourlyRatesManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [contractorId, setContractorId] = useState(null);
  
  // Rate State
  const [baseRate, setBaseRate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [specializationRates, setSpecializationRates] = useState([]); 

  useEffect(() => {
    fetchRates();
  }, [user]);

  const fetchRates = async () => {
    if (!user) return;
    try {
      const { data: contractor } = await supabase
        .from('contractors')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!contractor) {
          setLoading(false);
          return;
      }
      setContractorId(contractor.id);

      const rates = await getHourlyRates(contractor.id);
      if (rates) {
        setBaseRate(rates.base_rate);
        setCurrency(rates.currency);
        // Transform JSON object to array for easier editing
        const specs = Object.entries(rates.specialization_rates_json || {}).map(([name, rate]) => ({ name, rate }));
        setSpecializationRates(specs);
      }
    } catch (error) {
      console.error("Error fetching rates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
        // Convert array back to object
        const specsObj = specializationRates.reduce((acc, curr) => {
            if (curr.name && curr.rate) acc[curr.name] = parseFloat(curr.rate);
            return acc;
        }, {});

        await updateHourlyRates(contractorId, {
            base_rate: parseFloat(baseRate),
            currency,
            specialization_rates_json: specsObj
        });

        toast({ title: "Success", description: "Rates updated successfully." });
    } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const addSpecialization = () => {
      setSpecializationRates([...specializationRates, { name: '', rate: '' }]);
  };

  const updateSpecialization = (index, field, value) => {
      const newRates = [...specializationRates];
      newRates[index][field] = value;
      setSpecializationRates(newRates);
  };

  const removeSpecialization = (index) => {
      setSpecializationRates(specializationRates.filter((_, i) => i !== index));
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!contractorId) return <div className="p-8">Contractor profile required.</div>;

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold text-white mb-6">Hourly Rates</h1>
      
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" /> Base Rate
          </CardTitle>
          <CardDescription>Your standard hourly rate for general work.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hourly Rate</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                <Input 
                  type="number" 
                  className="pl-8 bg-gray-800 border-gray-700" 
                  value={baseRate}
                  onChange={(e) => setBaseRate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input 
                className="bg-gray-800 border-gray-700" 
                value={currency}
                disabled 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardHeader>
          <CardTitle>Specialized Rates</CardTitle>
          <CardDescription>Set different rates for specific skills (e.g. Backend vs Frontend).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {specializationRates.map((spec, index) => (
                <div key={index} className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                        <Label>Skill / Service</Label>
                        <Input 
                            placeholder="e.g. React Development" 
                            className="bg-gray-800 border-gray-700"
                            value={spec.name}
                            onChange={(e) => updateSpecialization(index, 'name', e.target.value)}
                        />
                    </div>
                    <div className="w-32 space-y-2">
                        <Label>Rate</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                            <Input 
                                type="number" 
                                className="pl-8 bg-gray-800 border-gray-700"
                                value={spec.rate}
                                onChange={(e) => updateSpecialization(index, 'rate', e.target.value)}
                            />
                        </div>
                    </div>
                    <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => removeSpecialization(index)}>
                        Remove
                    </Button>
                </div>
            ))}
            <Button variant="outline" onClick={addSpecialization} className="w-full border-dashed border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white mt-2">
                + Add Specialization
            </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 gap-2">
              <Save className="w-4 h-4" /> Save Changes
          </Button>
      </div>
    </div>
  );
};

export default HourlyRatesManager;