const Repository = require('../models/Repository');
const Controller = require('./Controller');
const queryString = require('query-string');

module.exports = 
class BookmarksController extends require('./Controller') {
    constructor(req, res){
        super(req, res);
        this.bookmarksRepository = new Repository('Bookmarks');
    }

    getAll(){
        this.response.JSON(this.bookmarksRepository.getAll());
    }
    get(id){
        if(!isNaN(id))
            this.response.JSON(this.bookmarksRepository.get(id));
        else{

            //Vérifie qu'il possède des arguments.
            if(this.req.url.indexOf('?') > -1)
            {
                let query = this.req.url.substring(this.req.url.indexOf('?') + 1,this.req.url.length);;
                
                //Vérifie si la fonction est de retourner les Arguments.
                if(query.length <= 0)
                    this.response.JSON(this.bookmarksRepository.getArg());
                else{
                    let args = this.getQueryStringParams();
                    let content = [];

                    //Vérifie si c'est un tri(sort).
                    if("sort" in args){
                        if((args.sort).toLowerCase() == "name") //Vérifie si le sort est par Nom.
                            content.push(this.bookmarksRepository.getAllSort("Name"));
                        else if((args.sort).toLowerCase() == "category") //Vérifie si le sort est par Catégorie.
                            content.push(this.bookmarksRepository.getAllSort("Category"));
                        else //Affiche une erreur vu qu'il n'existe pas d'autre sort.
                            this.response.notImplemented();
                    }

                    //Vérifie si c'est une recherche par Nom.
                    console.log(args);
                    if("name" in args){
                        if(args.name.endsWith('*')) //Vérifie si la recherche est incomplète.
                            content.push(this.bookmarksRepository.searchIncomplete("Name", args.name.substr(0, args.name.length -1)));
                        else //Fait la recherche avec le nom tel qu'il est.
                            content.push(this.bookmarksRepository.search("Name", args.name));
                    }

                    //Vérifie si c'est une recherche par Catégorie.
                    if("category" in args)
                        content.push(this.bookmarksRepository.search("Category", args.category));
                    
                   
                    //Vérifie qu'il a utilisé une fonction existante
                    if(content.length <= 0)
                        this.response.notImplemented();
                    else if(content.length == 1)
                        this.response.JSON(content[0]);
                    else
                        this.response.JSON(content);
                }
            }
            else
            {
                this.response.JSON(this.bookmarksRepository.getAll());
            }
        }
    }
    
    post(bookmark){  
        // todo : validate cour before insertion
        // todo : avoid duplicates
        let doubleName = this.bookmarksRepository.ValidateDoubleName(bookmark.Name);
        
        if(doubleName)
            this.response.conflict();
        else {
            let newBookmark = this.bookmarksRepository.add(bookmark);
            if (newBookmark) 
                this.response.created(JSON.stringify(newBookmark));
            else 
                this.response.internalError();
        }
    }
    put(bookmark){
        let doubleName = this.bookmarksRepository.ValidateDoubleName(bookmark.Name);

        if(doubleName)
            this.response.conflict();
        else {
            // todo : validate contact before updating
            if (this.bookmarksRepository.update(bookmark))
                this.response.ok();
            else 
                this.response.notFound();
        }
    }
    remove(id){
        if (this.bookmarksRepository.remove(id))
            this.response.accepted();
        else
            this.response.notFound();
    }
}