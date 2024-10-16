import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from '@/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
  industry: string;
  employees: number;
}

const CompanyManager: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newCompany, setNewCompany] = useState<Omit<Company, 'id'>>({ name: '', industry: '', employees: 0 });
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const companiesCollection = collection(db, 'companies');
      const companySnapshot = await getDocs(companiesCollection);
      const companyList = companySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
      setCompanies(companyList);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to fetch companies");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCompany(prev => ({ ...prev, [name]: name === 'employees' ? parseInt(value) : value }));
  };

  const addOrUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await updateDoc(doc(db, "companies", editingCompany.id), newCompany);
        toast.success("Company updated successfully");
      } else {
        await addDoc(collection(db, "companies"), newCompany);
        toast.success("Company added successfully");
      }
      setNewCompany({ name: '', industry: '', employees: 0 });
      setEditingCompany(null);
      fetchCompanies();
    } catch (error) {
      console.error("Error adding/updating company:", error);
      toast.error("Failed to add/update company");
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      await deleteDoc(doc(db, "companies", id));
      fetchCompanies();
      toast.success("Company deleted successfully");
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Failed to delete company");
    }
  };

  const startEditing = (company: Company) => {
    setEditingCompany(company);
    setNewCompany({ name: company.name, industry: company.industry, employees: company.employees });
  };

  return (
    <div className="p-6 bg-background text-foreground">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingCompany ? 'Edit Company' : 'Add New Company'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addOrUpdateCompany} className="space-y-4">
            <Input
              name="name"
              value={newCompany.name}
              onChange={handleInputChange}
              placeholder="Company Name"
              required
            />
            <Input
              name="industry"
              value={newCompany.industry}
              onChange={handleInputChange}
              placeholder="Industry"
              required
            />
            <Input
              name="employees"
              type="number"
              value={newCompany.employees}
              onChange={handleInputChange}
              placeholder="Number of Employees"
              required
            />
            <Button type="submit">{editingCompany ? 'Update Company' : 'Add Company'}</Button>
            {editingCompany && (
              <Button type="button" variant="outline" onClick={() => setEditingCompany(null)}>Cancel</Button>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((company) => (
          <Card key={company.id}>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold">{company.name}</h3>
              <p>Industry: {company.industry}</p>
              <p>Employees: {company.employees}</p>
              <div className="mt-4 space-x-2">
                <Button onClick={() => startEditing(company)}>Edit</Button>
                <Button variant="destructive" onClick={() => deleteCompany(company.id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CompanyManager;
