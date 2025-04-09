import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

type CustomerOption = {
  id: string;
  customerName: string;
};

type Props = {
  companyId: string;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
};

const CustomerAutocomplete: React.FC<Props> = ({ companyId, selectedCustomerId, setSelectedCustomerId }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!customerName) return;

    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await axios.get<CustomerOption[]>(`/api/${companyId}/customers/search?query=${customerName}`);
        setCustomerOptions(response.data);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [customerName, companyId]);

  return (
    <Autocomplete
      options={customerOptions}
      getOptionLabel={(option) => option.customerName}
      value={customerOptions.find((option) => option.id === selectedCustomerId) || null}
      onInputChange={(event, newInputValue) => setCustomerName(newInputValue)}
      onChange={(event, newValue) => setSelectedCustomerId(newValue?.id || null)}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Customer"
          variant="outlined"
          fullWidth
          required
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default CustomerAutocomplete;
