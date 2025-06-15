
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingPlan } from '@/types/database';
import { useAuth } from './useAuth';

export const useShoppingPlans = () => {
  const [plans, setPlans] = useState<ShoppingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPlans = async () => {
    if (!user) {
      setPlans([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching shopping plans for user:', user.id);
      const { data, error } = await supabase
        .from('shopping_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching shopping plans:', error);
        return;
      }

      console.log('Fetched plans:', data);

      // Transform the data to match our interface
      const transformedData = (data || []).map(plan => ({
        ...plan,
        items: Array.isArray(plan.items) ? plan.items : []
      })) as ShoppingPlan[];

      setPlans(transformedData);
    } catch (error) {
      console.error('Error fetching shopping plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (planData: Omit<ShoppingPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      console.log('Creating plan with data:', planData);
      const { data, error } = await supabase
        .from('shopping_plans')
        .insert([{
          ...planData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating shopping plan:', error);
        throw error;
      }

      console.log('Plan created successfully:', data);
      await fetchPlans(); // Refresh the plans list
      return data;
    } catch (error) {
      console.error('Error creating shopping plan:', error);
      throw error;
    }
  };

  const updatePlan = async (id: string, updates: Partial<ShoppingPlan>) => {
    try {
      const { data, error } = await supabase
        .from('shopping_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating shopping plan:', error);
        throw error;
      }

      await fetchPlans(); // Refresh the plans list
      return data;
    } catch (error) {
      console.error('Error updating shopping plan:', error);
      throw error;
    }
  };

  const deletePlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shopping_plans')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting shopping plan:', error);
        throw error;
      }

      await fetchPlans(); // Refresh the plans list
    } catch (error) {
      console.error('Error deleting shopping plan:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [user]);

  return {
    plans,
    loading,
    createPlan,
    updatePlan,
    deletePlan,
    refreshPlans: fetchPlans,
  };
};
