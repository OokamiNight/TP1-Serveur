module.exports = 
class Bookmarks{
    constructor(name, url, category)
    {
        this.Id = 0;
        this.Name = name !== undefined ? name : "";
        this.Url = undefined ? url : "";
        this.Category = undefined ? category : "";
    }
}