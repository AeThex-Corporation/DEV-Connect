import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '@/lib/db';
import { Loader2, Search, Filter, CheckCircle, MapPin, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

const ContractorDirectory = () => {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.searchContractors();
        setContractors(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = contractors.filter(c => 
    c.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
        <Helmet><title>Contractor Directory | Devconnect</title></Helmet>
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Talent Directory</h1>
                    <p className="text-muted-foreground">Find and hire verified professionals.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-grow md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name or skill..." 
                            className="pl-10 bg-glass"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline"><Filter className="w-4 h-4" /></Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(contractor => (
                        <div key={contractor.id} className="bg-glass rounded-xl p-6 border border-border hover:border-blue-500/50 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src={contractor.profiles?.avatar_url} />
                                        <AvatarFallback>{contractor.profiles?.display_name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold flex items-center gap-1">
                                            {contractor.profiles?.display_name}
                                            {contractor.status === 'approved' && <CheckCircle className="w-3 h-3 text-green-500" />}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">@{contractor.profiles?.username}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-sm">{contractor.hourly_rate}/hr</div>
                                    <div className="text-xs text-green-400">{contractor.availability}</div>
                                </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{contractor.bio}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                                {contractor.skills?.slice(0, 3).map(s => (
                                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                                ))}
                                {contractor.skills?.length > 3 && <Badge variant="outline" className="text-xs">+{contractor.skills.length - 3}</Badge>}
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="flex items-center gap-1 text-xs text-yellow-500">
                                    <Star className="w-3 h-3 fill-current" />
                                    {contractor.profiles?.reputation || 0} Rep
                                </div>
                                <Link to={`/contractors/${contractor.id}`}>
                                    <Button size="sm" variant="ghost" className="hover:text-blue-400">View Profile</Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">No contractors found matching your search.</div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default ContractorDirectory;