using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Drawing;

namespace SearchApi.Models
{
    public class SearchPerson
    {
        public long Id { get; set; }
        public string name { get; set; }
        public string address { get; set; }
        public string age { get; set; }
        public string interests { get; set; }
        public string pictureurl { get; set; }
    }
}
