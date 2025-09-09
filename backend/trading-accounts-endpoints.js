// Trading accounts endpoints
app.get('/api/trading-accounts', authenticateToken, async (req, res) => {
  try {
    const { data: tradingAccounts, error } = await supabase
      .from('trading_accounts')
      .select(`
        *,
        nominees (
          id,
          name,
          relation
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Trading accounts fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch trading accounts' });
    }

    console.log('📊 Fetched trading accounts for user:', req.user.id);
    res.json(tradingAccounts || []);
  } catch (error) {
    console.error('Trading accounts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch trading accounts' });
  }
});

app.post('/api/trading-accounts', authenticateToken, async (req, res) => {
  try {
    const { brokerName, clientId, dematNumber, nomineeId, currentValue, status, notes } = req.body;

    // Validate required fields
    if (!brokerName || !clientId || !dematNumber) {
      return res.status(400).json({ error: 'Broker name, client ID, and demat number are required' });
    }

    // Check if nominee belongs to user (if provided)
    if (nomineeId) {
      const { data: nominee, error: nomineeError } = await supabase
        .from('nominees')
        .select('id')
        .eq('id', nomineeId)
        .eq('user_id', req.user.id)
        .single();

      if (nomineeError || !nominee) {
        return res.status(400).json({ error: 'Invalid nominee selected' });
      }
    }

    const { data: newAccount, error } = await supabase
      .from('trading_accounts')
      .insert({
        user_id: req.user.id,
        broker_name: brokerName,
        client_id: clientId,
        demat_number: dematNumber,
        nominee_id: nomineeId || null,
        current_value: parseFloat(currentValue) || 0,
        status: status || 'Active',
        notes: notes || null
      })
      .select(`
        *,
        nominees (
          id,
          name,
          relation
        )
      `)
      .single();

    if (error) {
      console.error('Trading account creation error:', error);
      return res.status(500).json({ error: 'Failed to create trading account' });
    }

    console.log('✅ Created new trading account:', newAccount.id);
    res.status(201).json(newAccount);
  } catch (error) {
    console.error('Trading account creation error:', error);
    res.status(500).json({ error: 'Failed to create trading account' });
  }
});

app.put('/api/trading-accounts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { brokerName, clientId, dematNumber, nomineeId, currentValue, status, notes } = req.body;

    // Check if trading account belongs to user
    const { data: existingAccount, error: fetchError } = await supabase
      .from('trading_accounts')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existingAccount) {
      return res.status(404).json({ error: 'Trading account not found' });
    }

    // Check if nominee belongs to user (if provided)
    if (nomineeId) {
      const { data: nominee, error: nomineeError } = await supabase
        .from('nominees')
        .select('id')
        .eq('id', nomineeId)
        .eq('user_id', req.user.id)
        .single();

      if (nomineeError || !nominee) {
        return res.status(400).json({ error: 'Invalid nominee selected' });
      }
    }

    const { data: updatedAccount, error } = await supabase
      .from('trading_accounts')
      .update({
        broker_name: brokerName,
        client_id: clientId,
        demat_number: dematNumber,
        nominee_id: nomineeId || null,
        current_value: parseFloat(currentValue) || 0,
        status: status,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select(`
        *,
        nominees (
          id,
          name,
          relation
        )
      `)
      .single();

    if (error) {
      console.error('Trading account update error:', error);
      return res.status(500).json({ error: 'Failed to update trading account' });
    }

    console.log('✅ Updated trading account:', id);
    res.json(updatedAccount);
  } catch (error) {
    console.error('Trading account update error:', error);
    res.status(500).json({ error: 'Failed to update trading account' });
  }
});

app.delete('/api/trading-accounts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if trading account belongs to user
    const { data: existingAccount, error: fetchError } = await supabase
      .from('trading_accounts')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existingAccount) {
      return res.status(404).json({ error: 'Trading account not found' });
    }

    const { error } = await supabase
      .from('trading_accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Trading account deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete trading account' });
    }

    console.log('✅ Deleted trading account:', id);
    res.json({ message: 'Trading account deleted successfully' });
  } catch (error) {
    console.error('Trading account deletion error:', error);
    res.status(500).json({ error: 'Failed to delete trading account' });
  }
});
