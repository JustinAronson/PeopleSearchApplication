using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace SearchApi.Models
{
    public class SearchContext : DbContext
    {
        public SearchContext(DbContextOptions<SearchContext> options)
            : base(options)
        { 
        }

        public DbSet<SearchPerson> SearchPeople { get; set; }
    }
}
