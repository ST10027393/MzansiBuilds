namespace MzansiBuilds.Models
{
    public class Milestone
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsCompleted { get; set; } = false;

        // Navigation Property
        public Project? Project { get; set; }
    }
}