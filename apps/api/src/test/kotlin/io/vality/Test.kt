package io.vality

import io.vality.util.CuidGenerator
import org.junit.jupiter.api.Test

class Test {

    @Test
    fun cuidGeneratorTest() {
        val a = CuidGenerator.generate()
        val b = CuidGenerator.generate()
        val c = CuidGenerator.generate()
        val d = CuidGenerator.generate()
        println(a)
        println(b)
        println(c)
        println(d)
    }

}
