using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SearchApi.Models;

namespace SearchApi.Controllers
{
    [Route("api/SearchPeople")]
    [ApiController]
    public class SearchPeopleController : ControllerBase
    {
        private readonly SearchContext _context;

        public SearchPeopleController(SearchContext context)
        {
            _context = context;
        }

        // GET: api/SearchPeople
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SearchPerson>>> GetSearchPeople()
        {
            return await _context.SearchPeople.ToListAsync();
        }

        // GET: api/SearchPeople/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SearchPerson>> GetSearchPerson(long id)
        {
            var SearchPerson = await _context.SearchPeople.FindAsync(id);

            if (SearchPerson == null)
            {
                return NotFound();
            }

            return SearchPerson;
        }

        // PUT: api/SearchPeople/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSearchPerson(long id, SearchPerson SearchPerson)
        {
            if (id != SearchPerson.Id)
            {
                return BadRequest();
            }

            _context.Entry(SearchPerson).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SearchPersonExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/SearchPeople
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<SearchPerson>> PostSearchPerson(SearchPerson SearchPerson)
        {
            _context.SearchPeople.Add(SearchPerson);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSearchPerson), new { id = SearchPerson.Id }, SearchPerson);
        }

        // DELETE: api/SearchPeople/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSearchPerson(long id)
        {
            var SearchPerson = await _context.SearchPeople.FindAsync(id);
            if (SearchPerson == null)
            {
                return NotFound();
            }

            _context.SearchPeople.Remove(SearchPerson);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SearchPersonExists(long id)
        {
            return _context.SearchPeople.Any(e => e.Id == id);
        }
    }
}
