module.exports = {
    checkAccess (user_groups, auth_groups){

        // Loop through each user/authorised group combination
        // If match, return true.
        // If not, return false.
        for (user_group of user_groups){
            for(auth_group of auth_groups) {
                if (user_group === auth_group){
                    return true           
                }
            }
        }

        return false
    }
}