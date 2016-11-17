# TKL-API



Tämä ohjelma hakee ensin Geocode API:sta käyttäjän syöttämän tamperelaisen osoitteen koordinaatit ja etsii sen jälkeen lähietäisyydeltä bussipysäkkejä TKL:n API:sta. Ohjelma pyrkii hakemaan kolme lähintä bussipysäkkiä etsimällä ensin 400m koordinaattiboksista, ja jos pysäkkejä on alle 3, se lisää sädettä 100 metrillä ja etsii uudestaan. Tämän jälkeen ohjelma laskee etäisyydet ja esittää ne järjestyksessä. Etäisyyksien laskemiseen käytetään Haversine-kaavaa, mikä helkutti moinen sitten Suomeksi lieneekään, nimim. pitkä matematiikka käyty 10+ vuotta sitten.

Tarkoituksenani on hiljalleen lisäillä tähän sovellukseen ihan oikeitakin (ts. hyödyllisiä) toiminnallisuuksia, kohti uutta Repa Reittiopasta ja sen yli. Mahdollisesti palvelinpuolelle voisi tallentaa jotain istuntodataa jolla sitten personoida näkymää palaaville käyttäjille. Lähinnä homman nimi on kuitenkin (ainakin tähän mennessä) ollut yleinen APInointi ja JSON-derulo-tyyppinen autodidaktinen sähellys.

Tyylit purkkaviritelty kasaan Bootstrapilla, dynaamisten elementtien esitys hoidettu Angular-yks-piste-jollakin ja HTTP-anelut jQueryllä, tosin sekin taitais perusjutuiltaan olla integroituna tossa Angularissa.
